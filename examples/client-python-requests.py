import os
import time
import requests

base = os.getenv('GATEX_BASE_URL', 'http://127.0.0.1:8787')

payload = {
    'request_id': f'py-{int(time.time()*1000)}',
    'policy': 'default',
    'mode': 'strict',
    'insurance_mode': False,
    'signals': {
        'risk': {'score': 0.42, 'confidence': 0.86},
        'market': {'volatility': 0.24, 'slippage_bps': 12},
        'cost': {'fee_usd': 1, 'expected_value_usd': 12, 'this_cost_usd': 1},
        'account': {'balance_usd': 2000, 'position_size_usd': 120},
        'activity': {'recent_failures': 0, 'recent_actions_5m': 2, 'failure_rate_20': 0.03},
        'budget': {'today_spend_usd': 10, 'daily_budget_usd': 200, 'hard_cap_usd': 500},
        'counterparty': {
            'agent_reputation': 0.85,
            'recent_success_rate': 0.82,
            'recent_failure_rate': 0.12,
            'reviews_count': 20,
            'last_seen_days': 2,
            'price_usd': 2,
        },
    },
}

r = requests.post(f'{base}/api/gate/evaluate', json=payload, timeout=5)
r.raise_for_status()
out = r.json()

print({
    'decision': out.get('decision'),
    'fails': out.get('fails'),
    'verification_score': out.get('verification', {}).get('verification_score'),
    'processing_ms': out.get('runtime', {}).get('processing_ms'),
    'clamped_position_usd': out.get('computed', {}).get('clamped_position_usd'),
})
