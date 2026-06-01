"""
Masidy Engine - Powered by Qwen2.5-0.5B-Instruct
A lightweight AI assistant that runs on free CPU hardware.
"""

import json
import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"

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


def generate(message: str, history: list, context: str = "") -> str:
    system = SYSTEM_PROMPT
    if context:
        system += f"\n\nRetrieved context:\n{context}"

    messages = [{"role": "system", "content": system}]
    for user_msg, assistant_msg in history[-6:]:
        messages.append({"role": "user", "content": user_msg})
        messages.append({"role": "assistant", "content": assistant_msg})
    messages.append({"role": "user", "content": message})

    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer([text], return_tensors="pt")

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=512,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
        )

    generated = outputs[0][inputs.input_ids.shape[-1]:]
    return tokenizer.decode(generated, skip_special_tokens=True).strip()


def api_chat(payload: str) -> str:
    """JSON API endpoint for Masidy platform."""
    try:
        data = json.loads(payload)
        messages = data.get("messages", [])
        context = data.get("context", "")
        if not messages:
            return json.dumps({"error": "No messages provided"})
        last = messages[-1].get("content", "")
        history = []
        for i in range(0, len(messages) - 1, 2):
            if i + 1 < len(messages) - 1:
                history.append([
                    messages[i].get("content", ""),
                    messages[i + 1].get("content", ""),
                ])
        response = generate(last, history, context)
        return json.dumps({"response": response})
    except Exception as e:
        return json.dumps({"error": str(e)})


def chat_fn(message, history):
    history = history or []
    response = generate(message, history)
    history.append([message, response])
    return "", history


with gr.Blocks(title="Masidy Engine") as demo:
    gr.Markdown("## ⚡ Masidy Engine\nYour personal AI assistant.")

    with gr.Tab("Chat"):
        chatbot = gr.Chatbot(height=400)
        msg = gr.Textbox(placeholder="Ask Masidy anything...", label="Message")
        clear = gr.Button("Clear")
        msg.submit(chat_fn, [msg, chatbot], [msg, chatbot])
        clear.click(lambda: ([], ""), outputs=[chatbot, msg])

    with gr.Tab("API"):
        gr.Markdown("Send JSON: `{\"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}], \"context\": \"\"}`")
        api_input = gr.Textbox(label="JSON payload")
        api_output = gr.Textbox(label="Response")
        gr.Button("Test").click(api_chat, api_input, api_output)

demo.launch()
