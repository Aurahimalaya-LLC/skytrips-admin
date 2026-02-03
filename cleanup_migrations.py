import os
import shutil
import re

migration_dir = 'supabase/migrations'
archive_dir = 'supabase/migrations/archive'
os.makedirs(archive_dir, exist_ok=True)

files = sorted([f for f in os.listdir(migration_dir) if f.endswith('.sql')])
version_map = {}

for f in files:
    match = re.match(r'^(\d+)_', f)
    if match:
        version = match.group(1)
        if version not in version_map:
            version_map[version] = []
        version_map[version].append(f)

for version, file_list in version_map.items():
    if len(file_list) > 1:
        print(f'Found duplicates for {version}: {file_list}')
        keep = file_list[-1]
        to_move = file_list[:-1]
        for f in to_move:
            print(f'Moving {f} to archive')
            shutil.move(os.path.join(migration_dir, f), os.path.join(archive_dir, f))
