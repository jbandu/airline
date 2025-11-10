import os
from neo4j import GraphDatabase
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Connections
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

neo4j_driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
)

def migrate_priority_workflows(session):
    """Migrate priority workflows and their agents to Neo4j"""
    
    print("\n" + "="*70)
    print("MIGRATING PRIORITY WORKFLOWS & AGENTS TO NEO4J")
    print("="*70)
    
    # 1. Get workflows
    workflows = supabase.table('workflows').select('*').execute()
    versions = supabase.table('workflow_versions').select('*').execute()
    agents = supabase.table('agents').select('*').execute()
    
    print(f"\n📊 Data Summary:")
    print(f"   Workflows: {len(workflows.data)}")
    print(f"   Versions: {len(versions.data)}")
    print(f"   Agents: {len(agents.data)}")
    
    # 2. Create Workflow nodes
    print(f"\n🔄 Creating Workflow nodes...")
    workflow_count = 0
    for workflow in workflows.data:
        session.run("""
            MERGE (w:Workflow {id: $id})
            SET w.code = $code,
                w.name = $name,
                w.domain = $domain,
                w.subdomain = $subdomain,
                w.description = $description,
                w.summary = $summary
        """,
        id=str(workflow['id']),
        code=workflow.get('code'),
        name=workflow['name'],
        domain=workflow.get('domain'),
        subdomain=workflow.get('subdomain'),
        description=workflow.get('description'),
        summary=workflow.get('summary'))
        workflow_count += 1
    
    print(f"   ✅ Created {workflow_count} Workflow nodes")
    
    # 3. Create WorkflowVersion nodes and relationships
    print(f"\n🔄 Creating WorkflowVersion nodes...")
    version_count = 0
    for version in versions.data:
        session.run("""
            MATCH (w:Workflow {id: $workflow_id})
            MERGE (v:WorkflowVersion {id: $id})
            SET v.workflow_name = $workflow_name,
                v.domain = $domain,
                v.subdomain = $subdomain,
                v.agentic_potential = $agentic_potential,
                v.complexity = $complexity,
                v.autonomy_level = $autonomy_level,
                v.transformation_theme = $transformation_theme,
                v.ai_enabler_type = $ai_enabler_type,
                v.expected_roi_levers = $expected_roi_levers,
                v.operational_metrics_targeted = $operational_metrics_targeted,
                v.technology_stack = $technology_stack,
                v.agent_collaboration_pattern = $agent_collaboration_pattern,
                v.implementation_wave = $implementation_wave
            MERGE (w)-[:HAS_VERSION]->(v)
        """,
        id=str(version['id']),
        workflow_id=str(version['workflow_id']),
        workflow_name=version.get('workflow_name'),
        domain=version.get('domain'),
        subdomain=version.get('subdomain'),
        agentic_potential=version.get('agentic_potential'),
        complexity=version.get('complexity'),
        autonomy_level=version.get('autonomy_level'),
        transformation_theme=version.get('transformation_theme'),
        ai_enabler_type=version.get('ai_enabler_type'),
        expected_roi_levers=version.get('expected_roi_levers'),
        operational_metrics_targeted=version.get('operational_metrics_targeted'),
        technology_stack=version.get('technology_stack'),
        agent_collaboration_pattern=version.get('agent_collaboration_pattern'),
        implementation_wave=version.get('implementation_wave'))
        version_count += 1
    
    print(f"   ✅ Created {version_count} WorkflowVersion nodes")
    
    # 4. Create Agent nodes and relationships
    print(f"\n🔄 Creating Agent nodes...")
    agent_count = 0
    for agent in agents.data:
        session.run("""
            MERGE (a:Agent {id: $id})
            SET a.code = $code,
                a.name = $name,
                a.agent_type = $agent_type,
                a.description = $description,
                a.capabilities = $capabilities,
                a.autonomy_level = $autonomy_level,
                a.decision_complexity = $decision_complexity,
                a.input_systems = $input_systems,
                a.output_systems = $output_systems,
                a.technology_stack = $technology_stack,
                a.model_type = $model_type,
                a.collaboration_pattern = $collaboration_pattern
            
            WITH a
            MATCH (w:Workflow {id: $workflow_id})
            MERGE (a)-[:IMPLEMENTS]->(w)
        """,
        id=str(agent['id']),
        code=agent['code'],
        name=agent['name'],
        agent_type=agent.get('agent_type'),
        description=agent.get('description'),
        capabilities=agent.get('capabilities'),
        autonomy_level=agent.get('autonomy_level'),
        decision_complexity=agent.get('decision_complexity'),
        input_systems=agent.get('input_systems'),
        output_systems=agent.get('output_systems'),
        technology_stack=agent.get('technology_stack'),
        model_type=agent.get('model_type'),
        collaboration_pattern=agent.get('collaboration_pattern'),
        workflow_id=str(agent['workflow_id']) if agent.get('workflow_id') else None)
        agent_count += 1
    
    print(f"   ✅ Created {agent_count} Agent nodes")
    
    # 5. Create agent collaboration relationships
    print(f"\n🔄 Creating agent collaboration relationships...")
    collab_count = 0
    for agent in agents.data:
        if agent.get('collaborates_with'):
            for collab_code in agent['collaborates_with']:
                session.run("""
                    MATCH (a1:Agent {code: $agent_code})
                    MATCH (a2:Agent {code: $collab_code})
                    MERGE (a1)-[:COLLABORATES_WITH]->(a2)
                """,
                agent_code=agent['code'],
                collab_code=collab_code)
                collab_count += 1
    
    print(f"   ✅ Created {collab_count} collaboration relationships")
    
    print(f"\n" + "="*70)
    print("✅ MIGRATION COMPLETE!")
    print("="*70)
    
    return workflow_count, version_count, agent_count

def create_domain_hierarchy(session):
    """Create Domain and Subdomain nodes"""
    
    print("\n🔄 Creating domain hierarchy...")
    
    # Get unique domains and subdomains
    workflows = supabase.table('workflows').select('domain, subdomain').execute()
    
    domains = {}
    subdomains = {}
    
    for wf in workflows.data:
        domain = wf.get('domain')
        subdomain = wf.get('subdomain')
        
        if domain:
            domains[domain] = True
        
        if domain and subdomain:
            key = f"{domain}|{subdomain}"
            subdomains[key] = (domain, subdomain)
    
    # Create Domain nodes
    for domain in domains.keys():
        session.run("""
            MERGE (d:Domain {name: $name})
        """, name=domain)
    
    print(f"   ✅ Created {len(domains)} Domain nodes")
    
    # Create Subdomain nodes and relationships
    for key, (domain, subdomain) in subdomains.items():
        session.run("""
            MERGE (sd:Subdomain {name: $subdomain, domain: $domain})
            WITH sd
            MATCH (d:Domain {name: $domain})
            MERGE (sd)-[:BELONGS_TO]->(d)
        """, subdomain=subdomain, domain=domain)
    
    print(f"   ✅ Created {len(subdomains)} Subdomain nodes")
    
    # Link workflows to domains and subdomains
    for wf in workflows.data:
        domain = wf.get('domain')
        subdomain = wf.get('subdomain')
        
        if domain:
            session.run("""
                MATCH (w:Workflow {domain: $domain, subdomain: $subdomain})
                MATCH (d:Domain {name: $domain})
                MERGE (w)-[:IN_DOMAIN]->(d)
            """, domain=domain, subdomain=subdomain)
        
        if domain and subdomain:
            session.run("""
                MATCH (w:Workflow {domain: $domain, subdomain: $subdomain})
                MATCH (sd:Subdomain {name: $subdomain, domain: $domain})
                MERGE (w)-[:IN_SUBDOMAIN]->(sd)
            """, domain=domain, subdomain=subdomain)
    
    print(f"   ✅ Linked workflows to domains/subdomains")

def create_company_opportunities(session):
    """Create OPPORTUNITY_FOR relationships from companies to workflows"""
    
    print("\n🔄 Creating company → workflow opportunities...")
    
    # Priority 1: Airlines → Baggage workflows (NUMBER LABS!)
    result = session.run("""
        MATCH (company:Company)
        WHERE company.is_airline_company = true
        MATCH (w:Workflow)
        WHERE w.code LIKE 'WF-BAG%' OR w.code LIKE 'WF-PRIORITY-002'
        MERGE (company)-[r:OPPORTUNITY_FOR]->(w)
        SET r.confidence = 0.98,
            r.reason = 'number_labs_baggage_focus',
            r.priority = 'IMMEDIATE',
            r.number_labs_fit = true
        RETURN COUNT(r) as created
    """)
    bag_count = result.single()['created']
    print(f"   ✅ Airlines → Baggage workflows: {bag_count}")
    
    # Priority 2: Airlines → Flight Operations (COPA AIRLINES!)
    result = session.run("""
        MATCH (company:Company)
        WHERE company.is_airline_company = true
        MATCH (w:Workflow)-[:HAS_VERSION]->(v:WorkflowVersion)
        WHERE w.domain = 'Flight Operations'
          AND (w.code LIKE 'WF-FLT%' OR w.code LIKE 'WF-PRIORITY-001')
          AND v.agentic_potential >= 8
        MERGE (company)-[r:OPPORTUNITY_FOR]->(w)
        SET r.confidence = 0.95,
            r.reason = 'copa_airlines_target',
            r.priority = 'HIGH',
            r.copa_fit = true
        RETURN COUNT(r) as created
    """)
    flight_count = result.single()['created']
    print(f"   ✅ Airlines → Flight Operations: {flight_count}")
    
    # Priority 3: Airlines → High-Value Pax Protection
    result = session.run("""
        MATCH (company:Company)
        WHERE company.is_airline_company = true
        MATCH (w:Workflow)
        WHERE w.code LIKE 'WF-HVPAX%' OR w.code LIKE 'WF-PRIORITY-003'
        MERGE (company)-[r:OPPORTUNITY_FOR]->(w)
        SET r.confidence = 0.92,
            r.reason = 'revenue_protection_hauenstein',
            r.priority = 'HIGH'
        RETURN COUNT(r) as created
    """)
    hvp_count = result.single()['created']
    print(f"   ✅ Airlines → High-Value Pax: {hvp_count}")
    
    # Priority 4: Airlines → Disruption Management
    result = session.run("""
        MATCH (company:Company)
        WHERE company.is_airline_company = true
        MATCH (w:Workflow)-[:HAS_VERSION]->(v:WorkflowVersion)
        WHERE w.subdomain CONTAINS 'Disruption'
          AND v.agentic_potential >= 8
        MERGE (company)-[r:OPPORTUNITY_FOR]->(w)
        SET r.confidence = 0.90,
            r.reason = 'disruption_management',
            r.priority = 'HIGH'
        RETURN COUNT(r) as created
    """)
    dis_count = result.single()['created']
    print(f"   ✅ Airlines → Disruption Management: {dis_count}")
    
    total = bag_count + flight_count + hvp_count + dis_count
    print(f"\n   📊 Total opportunities created: {total}")

def run_migration():
    """Main migration function"""
    with neo4j_driver.session() as session:
        # Run migrations
        workflow_count, version_count, agent_count = migrate_priority_workflows(session)
        create_domain_hierarchy(session)
        create_company_opportunities(session)
        
        # Summary stats
        print("\n" + "="*70)
        print("📊 FINAL SUMMARY")
        print("="*70)
        
        stats = session.run("""
            RETURN 
                (SELECT COUNT(*) FROM (MATCH (w:Workflow) RETURN w)) as workflows,
                (SELECT COUNT(*) FROM (MATCH (v:WorkflowVersion) RETURN v)) as versions,
                (SELECT COUNT(*) FROM (MATCH (a:Agent) RETURN a)) as agents,
                (SELECT COUNT(*) FROM (MATCH (d:Domain) RETURN d)) as domains,
                (SELECT COUNT(*) FROM (MATCH ()-[r:OPPORTUNITY_FOR]->() RETURN r)) as opportunities
        """).single()
        
        print(f"   Workflows: {stats['workflows']}")
        print(f"   Versions: {stats['versions']}")
        print(f"   Agents: {stats['agents']}")
        print(f"   Domains: {stats['domains']}")
        print(f"   Opportunities: {stats['opportunities']}")
        print("="*70)

if __name__ == "__main__":
    run_migration()
    neo4j_driver.close()
