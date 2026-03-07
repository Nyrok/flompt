FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone https://github.com/Nyrok/flompt .

WORKDIR /app/backend

RUN pip install --no-cache-dir -r requirements.txt anthropic openai

RUN python -c "\
import textwrap; \
open('/app/backend/mcp_stdio.py','w').write(textwrap.dedent('''\
    import sys, os\n\
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))\n\
    os.chdir(os.path.dirname(os.path.abspath(__file__)))\n\
    from dotenv import load_dotenv\n\
    load_dotenv()\n\
    from app.mcp_server import mcp\n\
    if __name__ == \"__main__\":\n\
        mcp.run(transport=\"stdio\")\n\
'''))"

CMD ["python", "mcp_stdio.py"]
