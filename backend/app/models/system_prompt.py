from pydantic import BaseModel

class SystemPromptRequest(BaseModel):
    prompt: str

class SystemSection(BaseModel):
    name: str
    content: str

class SystemPromptResult(BaseModel):
    sections: list[SystemSection]
    full_prompt: str
    total_tokens: int
