import smtplib
import unittest
from unittest.mock import MagicMock, patch
from receipt_mailer import deliver, message


PAYLOAD = {'email': 'buyer@example.test', 'order': {
    'orderId': 'DOPA-SBX-0d8178e1-c6c7-4ab4-81a6-893be9d924ab',
    'items': [{'id': 'headphones', 'name': '<unsafe> Headphones', 'quantity': 1, 'price': 429000}],
    'subtotal': 429000, 'shippingCost': 15000, 'amount': 444000,
}}
ENV = {'SMTP_FROM': 'shop@example.test', 'SMTP_HOST': 'smtp.example.test', 'SMTP_PORT': '465',
       'SMTP_USE_SSL': 'true', 'SMTP_USER': 'shop', 'SMTP_PASS': 'offline-fixture'}


class ReceiptMailerTests(unittest.TestCase):
    def test_branded_plain_and_html_simulation_receipt_escapes_catalog_text(self):
        msg = message(PAYLOAD, ENV['SMTP_FROM'])
        self.assertIn('SIMULASI', msg['Subject'])
        self.assertIn('Rp444.000', msg.get_body(preferencelist=('plain',)).get_content())
        body = msg.get_body(preferencelist=('html',)).get_content()
        self.assertIn('&lt;unsafe&gt;', body)
        self.assertIn('bukan faktur pajak', body)
        self.assertNotIn('<unsafe>', body)
        self.assertNotIn('token', msg.as_string().lower())

    def test_recipient_header_injection_and_wrong_totals_rejected(self):
        with self.assertRaises(ValueError):
            message({**PAYLOAD, 'email': 'buyer@example.test\r\nBcc: other@example.test'}, ENV['SMTP_FROM'])
        with self.assertRaises(ValueError):
            message({**PAYLOAD, 'order': {**PAYLOAD['order'], 'amount': 1}}, ENV['SMTP_FROM'])

    @patch('receipt_mailer.smtplib.SMTP_SSL')
    def test_accepted_is_smtp_acceptance_even_when_quit_disconnects(self, factory):
        smtp = factory.return_value
        smtp.send_message.return_value = {}
        smtp.quit.side_effect = smtplib.SMTPServerDisconnected('fixture')
        self.assertEqual(deliver(PAYLOAD, ENV), 'accepted')
        smtp.login.assert_called_once_with('shop', 'offline-fixture')
        self.assertEqual(factory.call_args.kwargs['timeout'], 8)
        self.assertTrue(factory.call_args.kwargs['context'].check_hostname)

    @patch('receipt_mailer.smtplib.SMTP_SSL')
    def test_recipient_refused_is_failed_and_disconnect_after_data_is_unknown(self, factory):
        smtp = factory.return_value
        smtp.send_message.side_effect = smtplib.SMTPRecipientsRefused({'buyer@example.test': (550, 'fixture')})
        self.assertEqual(deliver(PAYLOAD, ENV), 'failed')
        smtp.send_message.side_effect = TimeoutError('fixture')
        self.assertEqual(deliver(PAYLOAD, ENV), 'unknown')

    @patch('receipt_mailer.smtplib.SMTP')
    def test_starttls_is_required_before_authentication(self, factory):
        smtp = factory.return_value
        smtp.send_message.return_value = {}
        self.assertEqual(deliver(PAYLOAD, {**ENV, 'SMTP_USE_SSL': 'false', 'SMTP_PORT': '587'}), 'accepted')
        self.assertTrue(smtp.starttls.call_args.kwargs['context'].check_hostname)
        self.assertEqual([c[0] for c in smtp.method_calls[:3]], ['starttls', 'login', 'send_message'])


if __name__ == '__main__':
    unittest.main()
