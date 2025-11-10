#!/usr/bin/env python3
"""
Intelligent Agent-to-Data Entity Mapping Script

This script analyzes your AI agents and creates intelligent mappings to data entities
based on agent names, types, and capabilities.

Usage:
    python scripts/map_agents_to_data.py

Requirements:
    pip install supabase python-dotenv
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import List, Dict

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("VITE_SUPABASE_URL"),
    os.getenv("VITE_SUPABASE_ANON_KEY")
)

# Agent-to-Data mapping rules
AGENT_MAPPING_RULES = {
    'delay_detection': {
        'keywords': ['delay', 'detection', 'disruption', 'schedule monitoring'],
        'data_entity': 'FLIFO',
        'access_pattern': 'stream',
        'latency_requirement': 'real-time',
        'query_frequency': 'continuous',
        'is_critical': True
    },
    'rebooking': {
        'keywords': ['rebooking', 'reaccommodation', 'disruption recovery'],
        'data_entities': ['PNR', 'FLIFO', 'INVENTORY'],
        'access_pattern': 'stream',
        'latency_requirement': 'real-time',
        'query_frequency': 'per_minute',
        'is_critical': True
    },
    'customer_context': {
        'keywords': ['customer', 'context', 'profile', 'history'],
        'data_entities': ['PNR', 'LOYALTY'],
        'access_pattern': 'on_demand',
        'latency_requirement': 'near-real-time',
        'query_frequency': 'per_minute',
        'is_critical': False
    },
    'bag_tracking': {
        'keywords': ['bag', 'baggage', 'luggage', 'tracking', 'misconnect'],
        'data_entity': 'BAGGAGE',
        'access_pattern': 'stream',
        'latency_requirement': 'real-time',
        'query_frequency': 'continuous',
        'is_critical': True
    },
    'pricing_optimization': {
        'keywords': ['pricing', 'revenue', 'yield', 'optimization', 'demand'],
        'data_entity': 'INVENTORY',
        'access_pattern': 'batch',
        'latency_requirement': 'near-real-time',
        'query_frequency': 'per_hour',
        'is_critical': False
    },
    'overbooking': {
        'keywords': ['overbooking', 'overbook', 'capacity', 'optimization'],
        'data_entity': 'INVENTORY',
        'access_pattern': 'scheduled',
        'latency_requirement': 'batch',
        'query_frequency': 'per_day',
        'is_critical': False
    },
    'connection_protection': {
        'keywords': ['connection', 'protect', 'transfer', 'misconnect'],
        'data_entities': ['FLIFO', 'PNR', 'MCT'],
        'access_pattern': 'stream',
        'latency_requirement': 'real-time',
        'query_frequency': 'continuous',
        'is_critical': True
    },
    'loyalty_tier': {
        'keywords': ['loyalty', 'tier', 'status', 'member', 'recognition'],
        'data_entity': 'LOYALTY',
        'access_pattern': 'batch',
        'latency_requirement': 'batch',
        'query_frequency': 'per_day',
        'is_critical': False
    },
    'clv_scoring': {
        'keywords': ['clv', 'lifetime value', 'customer value', 'scoring'],
        'data_entities': ['PNR', 'LOYALTY', 'E_TKT'],
        'access_pattern': 'batch',
        'latency_requirement': 'batch',
        'query_frequency': 'per_day',
        'is_critical': False
    },
    'refund_processing': {
        'keywords': ['refund', 'exchange', 'ticket', 'processing'],
        'data_entity': 'E_TKT',
        'access_pattern': 'on_demand',
        'latency_requirement': 'near-real-time',
        'query_frequency': 'per_minute',
        'is_critical': False
    },
    'weather_rerouting': {
        'keywords': ['weather', 'reroute', 'route optimization'],
        'data_entity': 'FLIFO',
        'access_pattern': 'stream',
        'latency_requirement': 'real-time',
        'query_frequency': 'continuous',
        'is_critical': True
    },
    'crew_scheduling': {
        'keywords': ['crew', 'scheduling', 'roster', 'assignment'],
        'data_entity': 'FLIFO',
        'access_pattern': 'scheduled',
        'latency_requirement': 'near-real-time',
        'query_frequency': 'per_hour',
        'is_critical': True
    },
    'demand_forecasting': {
        'keywords': ['demand', 'forecast', 'prediction', 'trend'],
        'data_entities': ['INVENTORY', 'PNR'],
        'access_pattern': 'batch',
        'latency_requirement': 'batch',
        'query_frequency': 'per_day',
        'is_critical': False
    },
    'schedule_optimization': {
        'keywords': ['schedule', 'optimization', 'planning', 'network'],
        'data_entity': 'SSM',
        'access_pattern': 'batch',
        'latency_requirement': 'batch',
        'query_frequency': 'per_day',
        'is_critical': False
    }
}


def fetch_agents() -> List[Dict]:
    """Fetch all active agents"""
    response = supabase.table('agents').select('id, name, type, description, active').eq('active', True).execute()
    return response.data


def fetch_data_entities() -> Dict[str, int]:
    """Fetch data entities and return code -> id mapping"""
    response = supabase.table('data_entities').select('id, code').execute()
    return {entity['code']: entity['id'] for entity in response.data}


def match_agent_to_entities(agent: Dict) -> List[Dict]:
    """
    Analyze agent and return list of matching data entities with mapping details
    """
    agent_text = f"{agent['name']} {agent.get('type', '')} {agent.get('description', '')}".lower()
    matches = []

    for rule_name, rule in AGENT_MAPPING_RULES.items():
        # Check if any keyword matches
        if any(keyword.lower() in agent_text for keyword in rule['keywords']):
            # Handle both single entity and multiple entities
            entities = rule.get('data_entities', [rule.get('data_entity')])
            if not isinstance(entities, list):
                entities = [entities]

            for entity in entities:
                if entity:  # Skip None values
                    matches.append({
                        'data_entity': entity,
                        'access_pattern': rule['access_pattern'],
                        'latency_requirement': rule['latency_requirement'],
                        'query_frequency': rule.get('query_frequency', 'per_minute'),
                        'is_critical': rule.get('is_critical', False)
                    })

    # Remove duplicates
    seen = set()
    unique_matches = []
    for match in matches:
        key = (match['data_entity'], match['access_pattern'])
        if key not in seen:
            seen.add(key)
            unique_matches.append(match)

    return unique_matches


def create_mapping(agent_id: int, data_entity_id: int, mapping_details: Dict) -> bool:
    """Create an agent-data mapping"""
    try:
        data = {
            'agent_id': agent_id,
            'data_entity_id': data_entity_id,
            'access_pattern': mapping_details['access_pattern'],
            'latency_requirement': mapping_details['latency_requirement'],
            'query_frequency': mapping_details['query_frequency'],
            'is_critical': mapping_details['is_critical']
        }

        supabase.table('agent_data_mappings').upsert(data).execute()
        return True
    except Exception as e:
        print(f"  ⚠️  Error creating mapping: {str(e)}")
        return False


def main():
    """Main execution"""
    print("🤖 Starting Agent-to-Data Entity Mapping...")
    print()

    # Fetch data
    print("📊 Fetching agents...")
    agents = fetch_agents()
    print(f"   Found {len(agents)} active agents")

    print("📊 Fetching data entities...")
    data_entities = fetch_data_entities()
    print(f"   Found {len(data_entities)} data entities")
    print()

    # Create mappings
    total_mappings = 0
    agents_mapped = 0

    for agent in agents:
        matches = match_agent_to_entities(agent)

        if matches:
            agents_mapped += 1
            print(f"🤖 {agent['name']}")

            for match in matches:
                entity_id = data_entities.get(match['data_entity'])
                if entity_id:
                    if create_mapping(agent['id'], entity_id, match):
                        critical_marker = " [CRITICAL]" if match['is_critical'] else ""
                        print(f"   ✅ → {match['data_entity']} ({match['access_pattern']}, {match['latency_requirement']}, {match['query_frequency']}){critical_marker}")
                        total_mappings += 1
                    else:
                        print(f"   ❌ → {match['data_entity']} (failed)")
            print()

    # Summary
    print("=" * 80)
    print("📈 SUMMARY")
    print("=" * 80)
    print(f"Total Agents:              {len(agents)}")
    print(f"Agents Mapped:             {agents_mapped}")
    print(f"Agents Not Mapped:         {len(agents) - agents_mapped}")
    print(f"Total Mappings Created:    {total_mappings}")
    print()

    # Show mapping distribution
    print("📊 Mappings by Data Entity:")
    try:
        result = supabase.table('agent_data_mappings').select('data_entity_id').execute()
        entity_counts = {}
        for mapping in result.data:
            entity_id = mapping['data_entity_id']
            entity_counts[entity_id] = entity_counts.get(entity_id, 0) + 1

        for code, entity_id in data_entities.items():
            count = entity_counts.get(entity_id, 0)
            if count > 0:
                print(f"   {code}: {count} agents")
    except Exception as e:
        print(f"   (Could not fetch counts: {str(e)})")

    print()

    # Show critical mappings
    print("⚠️  Critical Real-time Agents:")
    try:
        result = supabase.table('agent_data_mappings').select('agent_id, data_entity_id').eq('is_critical', True).execute()
        if result.data:
            for mapping in result.data[:5]:  # Show first 5
                agent = next((a for a in agents if a['id'] == mapping['agent_id']), None)
                entity_code = next((code for code, eid in data_entities.items() if eid == mapping['data_entity_id']), None)
                if agent and entity_code:
                    print(f"   • {agent['name']} → {entity_code}")
        else:
            print("   (None configured)")
    except Exception as e:
        print(f"   (Could not fetch: {str(e)})")

    print()
    print("✅ Agent mapping complete!")
    print()
    print("🎯 Next steps:")
    print("   1. Refresh your Data Entities page (/data/entities)")
    print("   2. You should now see both workflow AND agent counts")
    print("   3. Click on any entity to see which agents consume it")
    print()


if __name__ == "__main__":
    main()
