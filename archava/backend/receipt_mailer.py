"""One bounded SMTP attempt in its own process, with no raw errors/PII on stdout.

Accepted means the SMTP server accepted DATA, not that Gmail delivered to inbox.
Uncertain attempts are never automatically retried by the checkout outbox.
"""
import html
import json
import os
import re
import smtplib
import ssl
import sys
from email.message import EmailMessage
from email.utils import formatdate


def mailbox(value):
    if not isinstance(value, str) or len(value) > 254:
        raise ValueError('Invalid address')
    if not re.fullmatch(r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9-]+", value):
        raise ValueError('Invalid address')
    return value


def message(payload, sender):
    recipient = mailbox(payload['email'])
    order = payload['order']
    if not re.fullmatch(r'DOPA-SBX-[a-f0-9-]{36}', order['orderId']):
        raise ValueError('Invalid order')
    for key in ['subtotal', 'shippingCost', 'amount']:
        if type(order[key]) is not int or not 0 <= order[key] <= 100_000_000:
            raise ValueError('Invalid amount')
    if not isinstance(order['items'], list) or not 1 <= len(order['items']) <= 12:
        raise ValueError('Invalid items')
    for item in order['items']:
        if type(item['quantity']) is not int or not 1 <= item['quantity'] <= 10 or type(item['price']) is not int or item['price'] < 0:
            raise ValueError('Invalid line')
    if sum(i['quantity'] * i['price'] for i in order['items']) != order['subtotal'] or order['subtotal'] + order['shippingCost'] != order['amount']:
        raise ValueError('Invalid total')
    money = lambda value: 'Rp' + f'{value:,}'.replace(',', '.')
    lines = [f"{i['quantity']} × {i['name']} — {money(i['price'] * i['quantity'])}" for i in order['items']]
    summary = '\n'.join(lines) + f"\nSubtotal: {money(order['subtotal'])}\nOngkir contoh: {money(order['shippingCost'])}\nTotal simulasi: {money(order['amount'])}"
    msg = EmailMessage()
    msg['From'] = f'DOPAMINE <{mailbox(sender)}>'
    msg['To'] = recipient
    msg['Subject'] = 'DOPAMINE — Bukti pembayaran SIMULASI'
    msg['Date'] = formatdate(localtime=False)
    msg['Message-ID'] = f"<dopamine.{order['orderId']}@{sender.split('@')[1]}>"
    warning = 'Midtrans Sandbox. Tidak ada dana, pesanan, pengiriman atau pembelian nyata. Ini bukan faktur pajak.'
    msg.set_content(f"DOPAMINE\nPembayaran simulasi terkonfirmasi\nReferensi: {order['orderId']}\n\n{summary}\n\n{warning}\n\nAva — DOPAMINE")
    rows = ''.join(f"<tr><td style='padding:10px 0'>{html.escape(line)}</td></tr>" for line in lines)
    msg.add_alternative(f"""<!doctype html><html lang="id"><body style="margin:0;background:#fff9f5;color:#1f1f24;font-family:Arial,sans-serif;padding:24px">
<main style="max-width:580px;margin:auto;border:1px solid #e6dcee;border-radius:16px;overflow:hidden;background:white">
<header style="padding:24px;background:#7b3dff;color:white"><h1 style="margin:0">dopamine</h1><p>Good things. Happier you.</p></header>
<div style="padding:24px"><p style="background:#d5ff4f;padding:10px">MIDTRANS SANDBOX · SIMULASI</p>
<h2>Pembayaran simulasi terkonfirmasi</h2><p>Referensi: {html.escape(order['orderId'])}</p>
<table style="width:100%;border-collapse:collapse">{rows}</table>
<p>Subtotal: {money(order['subtotal'])}<br>Ongkir contoh: {money(order['shippingCost'])}</p>
<h3 style="color:#7b3dff">Total simulasi: {money(order['amount'])}</h3>
<p>{warning}</p><p>Terima kasih,<br>Ava — DOPAMINE</p></div></main></body></html>""", subtype='html')
    return msg


def deliver(payload, env=None):
    env = os.environ if env is None else env
    smtp = None
    sending_data = False
    try:
        msg = message(payload, env['SMTP_FROM'])
        context = ssl.create_default_context()
        host, port = env['SMTP_HOST'], int(env.get('SMTP_PORT') or 465)
        if env.get('SMTP_USE_SSL', 'true') == 'true':
            smtp = smtplib.SMTP_SSL(host, port, timeout=8, context=context)
        else:
            smtp = smtplib.SMTP(host, port, timeout=8)
            smtp.starttls(context=context)
        smtp.login(env['SMTP_USER'], env['SMTP_PASS'])
        sending_data = True
        refused = smtp.send_message(msg)
        if refused:
            return 'failed'
        return 'accepted'
    except (smtplib.SMTPRecipientsRefused, smtplib.SMTPSenderRefused, smtplib.SMTPDataError):
        return 'failed'
    except Exception:
        return 'unknown' if sending_data else 'failed'
    finally:
        if smtp:
            try:
                smtp.quit()
            except Exception:
                # A QUIT disconnect cannot undo a successful DATA acceptance.
                try:
                    smtp.close()
                except Exception:
                    pass


if __name__ == '__main__':
    try:
        raw = sys.stdin.buffer.read(20001)
        if len(raw) > 20000:
            raise ValueError('Payload too large')
        status = deliver(json.loads(raw))
    except Exception:
        status = 'failed'
    print(json.dumps({'status': status}))
