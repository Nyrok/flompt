#!/bin/bash
# keepalive.sh — Infinite loop that ensures supervisord is always running
# Starts and auto-restarts supervisord if it stops

SUPERVISORD=/home/botuser/.cache/pypoetry/virtualenvs/claude-code-telegram-9TtSrW0h-py3.11/bin/supervisord
SUPERVISORCTL=/home/botuser/.cache/pypoetry/virtualenvs/claude-code-telegram-9TtSrW0h-py3.11/bin/supervisorctl
CONF=/projects/flompt/supervisord.conf
LOG=/tmp/flompt-keepalive.log

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG; }

log "keepalive started (PID $$)"

while true; do
  if ! $SUPERVISORCTL -c $CONF status > /dev/null 2>&1; then
    log "supervisord DOWN — restarting..."

    # Free port 8000 if a zombie process is occupying it
    inode=$(awk '/00001F40/{print $10}' /proc/net/tcp 2>/dev/null | head -1)
    if [ -n "$inode" ]; then
      for pid in $(ls /proc/ 2>/dev/null | grep -E '^[0-9]+$'); do
        if ls -la /proc/$pid/fd 2>/dev/null | grep -q "socket:\[$inode\]"; then
          log "kill zombie PID $pid"
          kill $pid 2>/dev/null || true
        fi
      done
      sleep 1
    fi

    $SUPERVISORD -c $CONF >> $LOG 2>&1
    log "supervisord restarted"
  fi

  sleep 30
done
