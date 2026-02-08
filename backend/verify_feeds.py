import requests
import sys

base_url = 'http://localhost:8000/api/feeds'

try:
    # 1. Add Feed
    print('Adding feed...')
    res = requests.post(base_url + '/', json={'name': 'Test Feed', 'url': 'https://example.com/rss'})
    print(f'Add status: {res.status_code}, {res.text}')
    if res.status_code != 200:
        print("Failed to add feed")
        sys.exit(1)
        
    feed_id = res.json().get('id')
    print(f"Added feed with ID: {feed_id}")

    # 2. List Feeds
    print('Listing feeds...')
    res = requests.get(base_url + '/')
    print(f'List status: {res.status_code}, Found: {len(res.json())}')
    if res.status_code != 200:
        print("Failed to list feeds")
        sys.exit(1)

    # 3. Toggle Feed
    if feed_id:
        print(f'Toggling feed {feed_id}...')
        res = requests.patch(f'{base_url}/{feed_id}', json={'is_active': False})
        print(f'Toggle status: {res.status_code}, is_active: {res.json().get("is_active")}')
        if res.status_code != 200 or res.json().get("is_active") is not False:
             print("Failed to toggle feed")
             sys.exit(1)

    # 4. Delete Feed
    if feed_id:
        print(f'Deleting feed {feed_id}...')
        res = requests.delete(f'{base_url}/{feed_id}')
        print(f'Delete status: {res.status_code}')
        if res.status_code != 200:
             print("Failed to delete feed")
             sys.exit(1)
             
    print("ALL TESTS PASSED")

except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
