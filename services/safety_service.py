from models.risk_event import RiskEvent

def process_risk_event(event: RiskEvent):
    # Static recommendations for now
    recommended_contacts = {
        "helplines": [
            {"name": "KIRAN Mental Health Helpline", "phone": "1800-599-0019"},
            {"name": "Vandrevala Foundation Helpline", "phone": "1860-2662-345"}
        ],
        "emergency": "Dial 112 (India Emergency Services)"
    }

    return {
        "event": event.to_dict(),
        "contacts": recommended_contacts
    }
