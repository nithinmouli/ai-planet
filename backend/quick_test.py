import requests
import sys

def quick_test():
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"Server is running! Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        response = requests.get("http://localhost:8000/documents/", timeout=5)
        if response.status_code == 200:
            docs = response.json()
            print(f"Found {len(docs)} documents in database")
            if docs:
                print(f"Latest document: {docs[-1]['original_filename']}")
        
        return True
    except requests.exceptions.ConnectionError:
        print("Server not running on localhost:8000")
        print("Access the API via Swagger UI at: http://localhost:8000/docs")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    quick_test()
