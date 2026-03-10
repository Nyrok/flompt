import time
import httpx
from fastapi import APIRouter
from fastapi.responses import Response

router = APIRouter()

GOAL = 100
CACHE_TTL = 900  # 15 minutes

_cache: dict = {"stars": 0, "expires_at": 0}


async def _fetch_stars() -> int:
    now = time.time()
    if now < _cache["expires_at"]:
        return _cache["stars"]
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                "https://api.github.com/repos/Nyrok/flompt",
                headers={"Accept": "application/vnd.github+json"},
            )
            r.raise_for_status()
            count = r.json().get("stargazers_count", 0)
    except Exception:
        count = _cache["stars"]  # fall back to cached value on error
    _cache["stars"] = count
    _cache["expires_at"] = now + CACHE_TTL
    return count


def _build_svg(stars: int, goal: int) -> str:
    width = 460
    bar_x = 16
    bar_y = 34
    bar_w = width - 32
    bar_h = 12
    radius = 6
    pct = min(stars / goal, 1.0)
    fill_w = max(int(bar_w * pct), radius * 2 if pct > 0 else 0)

    label = f"{stars} / {goal} \u2b50 stars"
    pct_text = f"{int(pct * 100)}%"

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="58" role="img" aria-label="Star progress: {label}">
  <title>Star progress: {label}</title>
  <rect width="{width}" height="58" rx="8" fill="#ffffff" stroke="#d0d7de" stroke-width="1"/>
  <text x="{bar_x}" y="22" font-family="system-ui,-apple-system,sans-serif" font-size="13" fill="#24292f" font-weight="600">{label}</text>
  <text x="{width - bar_x}" y="22" font-family="system-ui,-apple-system,sans-serif" font-size="13" fill="#57606a" text-anchor="end">{pct_text}</text>
  <!-- track -->
  <rect x="{bar_x}" y="{bar_y}" width="{bar_w}" height="{bar_h}" rx="{radius}" fill="#eaeef2"/>
  <!-- fill -->
  {"" if fill_w == 0 else f'<rect x="{bar_x}" y="{bar_y}" width="{fill_w}" height="{bar_h}" rx="{radius}" fill="#238636"/>'}
</svg>"""


@router.get("/stars-svg", response_class=Response)
async def stars_svg() -> Response:
    """Returns a live SVG progress bar showing GitHub star count towards the goal."""
    stars = await _fetch_stars()
    svg = _build_svg(stars, GOAL)
    return Response(
        content=svg,
        media_type="image/svg+xml",
        headers={
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
        },
    )
