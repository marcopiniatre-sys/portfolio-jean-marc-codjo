Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

public class LocalPortfolioServer {
    public static void Serve(string rootDir, int port) {
        var listener = new TcpListener(IPAddress.Loopback, port);
        listener.Start();
        Console.WriteLine("Portfolio disponible sur http://127.0.0.1:" + port + "/ (Ctrl+C pour arreter)");
        while (true) {
            var client = listener.AcceptTcpClient();
            ThreadPool.QueueUserWorkItem(_ => Handle(client, rootDir));
        }
    }

    static string GetMime(string ext) {
        switch (ext.ToLower()) {
            case ".html": return "text/html; charset=utf-8";
            case ".css":  return "text/css; charset=utf-8";
            case ".js":   return "application/javascript; charset=utf-8";
            case ".json": return "application/json; charset=utf-8";
            case ".svg":  return "image/svg+xml";
            case ".png":  return "image/png";
            case ".jpg":  return "image/jpeg";
            case ".pdf":  return "application/pdf";
            case ".xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case ".pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            default:      return "application/octet-stream";
        }
    }

    static void Handle(TcpClient client, string rootDir) {
        try {
            using (client)
            using (var stream = client.GetStream())
            using (var reader = new StreamReader(stream, Encoding.ASCII, false, 1024, true)) {
                string reqLine = reader.ReadLine();
                if (string.IsNullOrEmpty(reqLine)) return;
                string[] parts = reqLine.Split(' ');
                string method = parts[0];
                string rawPath = parts.Length > 1 ? parts[1] : "/";
                int q = rawPath.IndexOf('?');
                if (q >= 0) rawPath = rawPath.Substring(0, q);
                string rel = Uri.UnescapeDataString(rawPath.TrimStart('/'));
                if (string.IsNullOrEmpty(rel)) rel = "index.html";
                string full = Path.Combine(rootDir, rel.Replace('/', Path.DirectorySeparatorChar));

                if (File.Exists(full)) {
                    byte[] body = File.ReadAllBytes(full);
                    string hdr = "HTTP/1.1 200 OK\r\nContent-Type: " + GetMime(Path.GetExtension(full)) +
                                 "\r\nContent-Length: " + body.Length + "\r\nConnection: close\r\n\r\n";
                    byte[] hBytes = Encoding.ASCII.GetBytes(hdr);
                    stream.Write(hBytes, 0, hBytes.Length);
                    if (method != "HEAD") stream.Write(body, 0, body.Length);
                } else {
                    byte[] nf = Encoding.ASCII.GetBytes("HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\nNot Found");
                    stream.Write(nf, 0, nf.Length);
                }
            }
        } catch {}
    }
}
"@

[LocalPortfolioServer]::Serve($PSScriptRoot, 8080)
