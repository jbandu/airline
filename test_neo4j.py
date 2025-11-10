import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

print(f"Testing Neo4j connection...")
print(f"URI: {uri}")
print(f"User: {user}")
print(f"Password: {'*' * len(password)}")

try:
    driver = GraphDatabase.driver(uri, auth=(user, password))
    with driver.session() as session:
        result = session.run("RETURN 1 as test")
        print(f"\n✅ SUCCESS! Connected to Neo4j")
        print(f"Test query result: {result.single()['test']}")
    driver.close()
except Exception as e:
    print(f"\n❌ FAILED! Error: {e}")
    print(f"\nPlease reset your Neo4j password at: https://console.neo4j.io")
