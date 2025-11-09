#!/usr/bin/env python3
"""
Intelligent Workflow-to-Data Entity Mapping Script

This script analyzes your workflows and creates intelligent mappings to data entities
based on workflow names, descriptions, and subdomain context.

Usage:
    python scripts/map_workflows_to_data.py

Requirements:
    pip install supabase python-dotenv
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import List, Dict, Set

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("VITE_SUPABASE_URL"),
    os.getenv("VITE_SUPABASE_ANON_KEY")
)

# Mapping rules: keyword patterns → (data_entity_code, access_type, is_primary, volume, latency)
MAPPING_RULES = {
    'flight_operations': {
        'keywords': ['flight', 'delay', 'departure', 'arrival', 'dispatch', 'operations', 'crew scheduling'],
        'data_entity': 'FLIFO',
        'access_type': 'read_write',
        'is_primary': True,
        'volume_estimate': 'high',
        'latency_requirement': 'real-time'
    },
    'customer_service': {
        'keywords': ['customer', 'passenger', 'service', 'check-in', 'boarding', 'rebooking', 'disruption'],
        'data_entity': 'PNR',
        'access_type': 'read_write',
        'is_primary': True,
        'volume_estimate': 'high',
        'latency_requirement': 'near-real-time'
    },
    'loyalty': {
        'keywords': ['loyalty', 'member', 'upgrade', 'recognition', 'tier', 'miles', 'points'],
        'data_entity': 'LOYALTY',
        'access_type': 'read',
        'is_primary': False,
        'volume_estimate': 'medium',
        'latency_requirement': 'near-real-time'
    },
    'revenue_management': {
        'keywords': ['revenue', 'pricing', 'yield', 'inventory', 'seat', 'availability', 'capacity', 'demand'],
        'data_entity': 'INVENTORY',
        'access_type': 'read_write',
        'is_primary': True,
        'volume_estimate': 'very_high',
        'latency_requirement': 'real-time'
    },
    'ticketing': {
        'keywords': ['ticket', 'fare', 'refund', 'exchange', 'payment', 'revenue accounting'],
        'data_entity': 'E_TKT',
        'access_type': 'read_write',
        'is_primary': True,
        'volume_estimate': 'high',
        'latency_requirement': 'near-real-time'
    },
    'baggage': {
        'keywords': ['bag', 'luggage', 'misconnect', 'ground', 'ramp', 'loading'],
        'data_entity': 'BAGGAGE',
        'access_type': 'read_write',
        'is_primary': True,
        'volume_estimate': 'high',
        'latency_requirement': 'real-time'
    },
    'schedule_planning': {
        'keywords': ['schedule', 'planning', 'network', 'route', 'frequency'],
        'data_entity': 'SSM',
        'access_type': 'read_write',
        'is_primary': True,
        'volume_estimate': 'low',
        'latency_requirement': 'batch'
    },
    'connections': {
        'keywords': ['connect', 'transfer', 'minimum connect', 'mct'],
        'data_entity': 'MCT',
        'access_type': 'read',
        'is_primary': False,
        'volume_estimate': 'low',
        'latency_requirement': 'on-demand'
    }
}


def fetch_workflows() -> List[Dict]:
    """Fetch all active workflows"""
    response = supabase.table('workflows').select('id, name, description, subdomain_id').is_('archived_at', None).execute()
    return response.data


def fetch_data_entities() -> Dict[str, int]:
    """Fetch data entities and return code -> id mapping"""
    response = supabase.table('data_entities').select('id, code').execute()
    return {entity['code']: entity['id'] for entity in response.data}


def match_workflow_to_entities(workflow: Dict) -> List[Dict]:
    """
    Analyze workflow and return list of matching data entities with mapping details
    """
    workflow_text = f"{workflow['name']} {workflow.get('description', '')}".lower()
    matches = []

    for rule_name, rule in MAPPING_RULES.items():
        # Check if any keyword matches
        if any(keyword.lower() in workflow_text for keyword in rule['keywords']):
            matches.append({
                'data_entity': rule['data_entity'],
                'access_type': rule['access_type'],
                'is_primary_data': rule['is_primary'],
                'volume_estimate': rule['volume_estimate'],
                'latency_requirement': rule['latency_requirement']
            })

    return matches


def create_mapping(workflow_id: int, data_entity_id: int, mapping_details: Dict) -> bool:
    """Create a workflow-data mapping"""
    try:
        data = {
            'workflow_id': workflow_id,
            'data_entity_id': data_entity_id,
            'access_type': mapping_details['access_type'],
            'is_primary_data': mapping_details['is_primary_data'],
            'volume_estimate': mapping_details['volume_estimate'],
            'latency_requirement': mapping_details['latency_requirement']
        }

        supabase.table('workflow_data_mappings').upsert(data).execute()
        return True
    except Exception as e:
        print(f"  ⚠️  Error creating mapping: {str(e)}")
        return False


def main():
    """Main execution"""
    print("🚀 Starting Workflow-to-Data Entity Mapping...")
    print()

    # Fetch data
    print("📊 Fetching workflows...")
    workflows = fetch_workflows()
    print(f"   Found {len(workflows)} active workflows")

    print("📊 Fetching data entities...")
    data_entities = fetch_data_entities()
    print(f"   Found {len(data_entities)} data entities")
    print()

    # Create mappings
    total_mappings = 0
    workflows_mapped = 0

    for workflow in workflows:
        matches = match_workflow_to_entities(workflow)

        if matches:
            workflows_mapped += 1
            print(f"📌 {workflow['name']}")

            for match in matches:
                entity_id = data_entities.get(match['data_entity'])
                if entity_id:
                    if create_mapping(workflow['id'], entity_id, match):
                        print(f"   ✅ → {match['data_entity']} ({match['access_type']}, {match['latency_requirement']})")
                        total_mappings += 1
                    else:
                        print(f"   ❌ → {match['data_entity']} (failed)")
            print()

    # Summary
    print("=" * 60)
    print("📈 SUMMARY")
    print("=" * 60)
    print(f"Total Workflows:           {len(workflows)}")
    print(f"Workflows Mapped:          {workflows_mapped}")
    print(f"Workflows Not Mapped:      {len(workflows) - workflows_mapped}")
    print(f"Total Mappings Created:    {total_mappings}")
    print()

    # Show mapping distribution
    print("📊 Mappings by Data Entity:")
    response = supabase.rpc('get_workflow_counts_by_entity').execute()

    # Alternative if RPC doesn't exist - query directly
    try:
        result = supabase.table('workflow_data_mappings').select('data_entity_id').execute()
        entity_counts = {}
        for mapping in result.data:
            entity_id = mapping['data_entity_id']
            entity_counts[entity_id] = entity_counts.get(entity_id, 0) + 1

        for code, entity_id in data_entities.items():
            count = entity_counts.get(entity_id, 0)
            print(f"   {code}: {count} workflows")
    except Exception as e:
        print(f"   (Could not fetch counts: {str(e)})")

    print()
    print("✅ Mapping complete!")
    print()
    print("🎯 Next steps:")
    print("   1. Refresh your Data Entities page (/data/entities)")
    print("   2. You should now see workflow counts for each entity")
    print("   3. Click on any entity to see which workflows use it")
    print()


if __name__ == "__main__":
    main()
