import paramiko
import sys

HOST = "66.116.250.237"
USER = "root"
PASS = "Tnteachers@2026"

def run_remote(command):
    print(f"\n>>> Running: {command}")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(HOST, username=USER, password=PASS, timeout=15)
        stdin, stdout, stderr = client.exec_command(command, get_pty=True)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        # Print with utf-8 encoding to avoid Windows cp1252 crash
        sys.stdout.buffer.write(out.encode('utf-8', errors='replace'))
        if err:
            sys.stdout.buffer.write(f"\n[STDERR]: {err}\n".encode('utf-8', errors='replace'))
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "-f" and len(sys.argv) > 2:
            with open(sys.argv[2], "r", encoding="utf-8") as f:
                cmd = f.read()
        else:
            cmd = " ".join(sys.argv[1:])
    else:
        cmd = "uname -a; uptime; ls -la /var/www"
    run_remote(cmd)
