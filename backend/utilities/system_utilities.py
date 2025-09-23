def is_running_in_docker() -> bool:
    try:
        with open('/proc/self/cgroup', 'r') as f:
            cgroup_info = f.read()
        return 'docker' in cgroup_info or 'container' in cgroup_info
    except FileNotFoundError:
        return False