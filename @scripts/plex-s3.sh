# Environment
PLEX_CLAIM=""
S3_BUCKET=""
ACCESS_KEY_ID=""
SECRET_ACCESS_KEY=""
MEDIA_MOUNT="/mnt/media"

[ ! -f "$PWD/.env" ] || export $(grep -v '^#' "$PWD/.env" | xargs)

[ -z "$PLEX_CLAIM" ] && echo "Requires PLEX_CLAIM environment variable"
[ -z "$S3_BUCKET" ] && echo "Requires S3_BUCKET environment variable"
[ -z "$ACCESS_KEY_ID" ] && echo "Requires ACCESS_KEY_ID environment variable"
[ -z "$SECRET_ACCESS_KEY" ] && echo "Requires SECRET_ACCESS_KEY environment variable"

# SETUP
sudo apt install -y && apt update -y;

# SETUP S3 FUSE
sudo apt install -y s3fs

echo user_allow_other > /etc/fuse.conf
echo "$ACCESS_KEY_ID:$SECRET_ACCESS_KEY" > ${HOME}/.passwd-s3fs
chmod 600 ${HOME}/.passwd-s3fs
[ -d "$MEDIA_MOUNT" ] && umount "$MEDIA_MOUNT" || true
[ ! -d "$MEDIA_MOUNT" ] && mkdir "$MEDIA_MOUNT"
echo "mount s3 bucket $S3_BUCKET > $MEDIA_MOUNT"
s3fs "$S3_BUCKET" "$MEDIA_MOUNT" -o passwd_file=${HOME}/.passwd-s3fs -o allow_other

# SETUP PLEX

# Install docker is missing
if [ -x "$(command -v docker)" ]; then
    echo "docker installed"
  else
    echo "Install docker"
    curl -fsSL https://get.docker.com -o get-docker.sh; sudo sh get-docker.sh
fi

sudo usermod -aG docker $USER

container_name=plex;
public_id_address=$(ip -4 -o addr show eth0 | awk '{print $4}' | cut -d "/" -f 1 | head -n 1)

# Stop plex container if running
[ "$(docker ps -a -q -f name=$container_name)" ] && docker stop $container_name && docker rm $container_name

# Start plex
echo "http://$public_id_address:32400/"
docker run \
  --name=$container_name \
  --net=host \
  -e PUID=$(id -u) \
  -e PGID=$(id -g) \
  -e TZ=Etc/UTC \
  -e VERSION=docker \
  -e ADVERTISE_IP="$public_id_address:32400/" \
  -e HOSTNAME=$public_id_address \
  -e PLEX_CLAIM="$PLEX_CLAIM" \
  -v /root/plex/config:/config \
  -v $MEDIA_MOUNT/downloads:/media \
  lscr.io/linuxserver/plex:latest