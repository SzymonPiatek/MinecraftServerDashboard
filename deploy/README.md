# Wdrożenie na VPS

Schemat: Caddy (HTTPS) → `mc.spiatek.pl`: `/api/*` na API, reszta na web. Serwer Minecraft (`spiatek.pl:25565`), API, web, Caddy i proxy do Dockera działają w `docker-compose.yml`. Po pushu na `main` GitHub Actions buduje obrazy, wypycha je do GHCR i przez SSH uruchamia `deploy/deploy.sh` na VPS-ie.

Założenia: użytkownik `ubuntu` (UID 1000), repo w `~/app`, świat Minecrafta w `~/server`.

## 1. VPS: przygotowanie

**DNS:** rekord A `mc.spiatek.pl` → IP VPS-a (bez tego Caddy nie dostanie certyfikatu).

**Sprawdź architekturę i Javę** (obrazy w CI są budowane pod `linux/amd64`):

```bash
uname -m          # oczekiwane: x86_64
java -version     # wersja Javy, na której działa Twój server.jar
ls -ln ~/server   # właściciel plików powinien mieć UID 1000
```

Jeśli Java jest inna niż 25, ustaw `MC_IMAGE_TAG` (np. `java21`) w `.env` poniżej.

**Docker:**

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu     # potem wyloguj się i zaloguj ponownie
docker compose version
```

**Kopia zapasowa i zatrzymanie starego serwera** (w screenie wpisz `stop`, potem):

```bash
tar czf ~/server-backup-$(date +%F).tgz -C ~ server
```

Uwaga: obraz `itzg/minecraft-server` nadpisuje przy starcie część ustawień w `server.properties` (RCON, Query, whitelista) wartościami z compose.

**Repozytorium** (publiczne, więc bez kluczy):

```bash
git clone https://github.com/SzymonPiatek/MinecraftServerDashboard.git ~/app
```

**`~/app/.env`:**

```bash
cd ~/app && cat > .env <<EOF
IMAGE_PREFIX=ghcr.io/szymonpiatek/minecraftserverdashboard
IMAGE_TAG=latest
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<ustaw-haslo-min-8-znakow>
RCON_PASSWORD=$(openssl rand -hex 24)
MC_DATA_DIR=/home/ubuntu/server
MC_MEMORY=3G
MC_IMAGE_TAG=java25
EOF
chmod 600 .env
```

Zamień `<ustaw-haslo-min-8-znakow>` na własne hasło (tym hasłem zalogujesz się do panelu).

**Firewall** (Docker i tak publikuje tylko 80, 443 i 25565; RCON i API nie są wystawione):

```bash
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443 && sudo ufw allow 25565/tcp
sudo ufw enable
```

## 2. GitHub: sekrety i klucz SSH

Na swoim komputerze:

```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
ssh-copy-id -i deploy_key.pub ubuntu@<IP-VPS>
ssh-keyscan -t ed25519 <IP-VPS>        # skopiuj wynik do sekretu DEPLOY_KNOWN_HOSTS
```

W repo: **Settings → Environments → New environment → `Minecraft Server Dashboard Production`**, potem dodaj sekrety:

| Sekret               | Wartość                                 |
| -------------------- | --------------------------------------- |
| `DEPLOY_HOST`        | adres VPS                               |
| `DEPLOY_USER`        | `ubuntu`                                |
| `DEPLOY_SSH_KEY`     | zawartość prywatnego pliku `deploy_key` |
| `DEPLOY_KNOWN_HOSTS` | wynik `ssh-keyscan`                     |

Potem usuń lokalnie `deploy_key` i `deploy_key.pub`.

## 3. Pierwsze wdrożenie

1. Zmerguj gałąź do `main`. CI zbuduje i wypchnie obrazy do GHCR. Job `deploy` za pierwszym razem **się nie powiedzie**: paczki są jeszcze prywatne, więc VPS nie może ich pobrać.
2. Na GitHubie: **profil → Packages**, dla obu paczek (`minecraftserverdashboard-api` i `-web`) → **Package settings → Change visibility → Public**.
3. W Actions otwórz nieudany run i kliknij **Re-run failed jobs**. Deploy pobierze obrazy i uruchomi cały stos (z serwerem Minecraft i Caddy).
4. Na VPS-ie utwórz konto admina:

```bash
cd ~/app && docker compose exec api node dist/scripts/seed-admin.js
```

Od teraz każdy push na `main` wdraża się sam.

## 4. Sprawdzenie

```bash
cd ~/app
docker compose ps                          # wszystkie usługi Up, api/web/minecraft healthy
docker compose logs -f minecraft          # "Done (...)!" oznacza, że serwer wystartował
curl -s https://mc.spiatek.pl/api/status  # "online": true
```

Następnie zaloguj się przez `POST /api/auth/login` i wyślij komendę `list` przez `POST /api/admin/console`, żeby sprawdzić RCON.

## 5. Na co dalej uważać

- **Wycofanie zmian:** `cd ~/app && IMAGE_TAG=sha-<stary-commit> docker compose up -d` (tagi są widoczne w paczkach na GitHubie).
- **Kopie zapasowe:** świat w `~/server` oraz baza w wolumenie `api-data` (`docker run --rm --volumes-from $(docker compose ps -q api) -v $PWD:/b alpine tar czf /b/api-data.tgz -C /data .`).
- **Restart serwera MC** nie następuje przy zwykłym deployu strony (Compose przeładowuje tylko zmienione usługi).
- Po utworzeniu admina możesz usunąć `ADMIN_PASSWORD` z `.env` i zrobić `docker compose up -d`.

## Gdy coś nie działa

| Objaw                                     | Co sprawdzić                                                                      |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| Caddy nie dostaje certyfikatu             | rekord A `mc.spiatek.pl`, porty 80/443 otwarte, `docker compose logs caddy`       |
| Deploy: `denied` przy pull                | paczki GHCR nie są publiczne (krok 3.2)                                           |
| `/api/status` pokazuje `online: false`    | `docker compose logs minecraft` (wersja Javy, EULA, brak `server.jar`)            |
| Konsola: „unreachable via RCON"           | serwer jeszcze się ładuje albo zmieniłeś `RCON_PASSWORD` bez restartu `minecraft` |
| Minecraft: `Permission denied` na `/data` | właściciel `~/server` ma inny UID niż 1000 (`sudo chown -R 1000:1000 ~/server`)   |
| Zmiana stanu serwera z panelu zwraca 503  | `docker compose logs docker-proxy api`                                            |
