"""
Masidy Engine - Powered by Qwen2.5-0.5B-Instruct
Exposes a simple /chat API endpoint for the Masidy platform.
"""

import json
import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL_ID = "masidy/masidy-model"

print("Loading Masidy Engine...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float32,
    device_map="cpu",
)
model.eval()
print("Masidy Engine ready.")

SYSTEM_PROMPT = (
    "You are Masidy, a helpful AI assistant created by the Masidy team. "
    "You are intelligent, concise, and friendly. "
    "Never mention Qwen, Meta, Alibaba, or any other AI company. "
    "If asked who made you, say: I am Masidy, created by the Masidy team. "
    "Always respond in the same language the user writes in."
)


def generate(message: str, context: str = "") -> str:
    system = SYSTEM_PROMPT
    if context:
        system += f"\n\nContext:\n{context[:500]}"

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": message},
    ]

    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer([text], return_tensors="pt")

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=300,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
        )

    generated = outputs[0][inputs.input_ids.shape[-1]:]
    return tokenizer.decode(generated, skip_special_tokens=True).strip()


def chat_api(message: str, context: str) -> str:
    """API tab: takes message + context, returns JSON response."""
    if not message:
        return json.dumps({"error": "No message"})
    try:
        response = generate(message, context)
        return json.dumps({"response": response})
    except Exception as e:
        return json.dumps({"error": str(e)})


def chat_ui(message: str, history: list):
    """Chat tab: simple conversational UI."""
    response = generate(message)
    history = history or []
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": response})
    return "", history


with gr.Blocks(title="Masidy Engine") as demo:
    gr.Markdown("## ⚡ Masidy Engine\nYour personal AI assistant.")

    with gr.Tab("Chat"):
        chatbot = gr.Chatbot(height=400, type="messages")
        msg = gr.Textbox(placeholder="Ask Masidy anything...", label="Message")
        clear = gr.Button("Clear")
        msg.submit(chat_ui, [msg, chatbot], [msg, chatbot])
        clear.click(lambda: ([], ""), outputs=[chatbot, msg])

    with gr.Tab("API"):
        gr.Markdown("""
        **Usage from Masidy platform:**
        - Input: message + optional context
        - Output: JSON `{"response": "..."}`
        """)
        api_message = gr.Textbox(label="Message", placeholder="Hello, who are you?")
        api_context = gr.Textbox(label="Context (optional)", placeholder="Retrieved web content...")
        api_output = gr.Textbox(label="JSON Response")
        gr.Button("Run").click(chat_api, [api_message, api_context], api_output)

demo.launch()
