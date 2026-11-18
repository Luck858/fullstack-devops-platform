
aws_region   = "ap-south-1"
project_name = "fullstack-devops"
vpc_cidr     = "10.20.0.0/16"

cluster_name = "fullstack-devops-eks"

kubernetes_version = "1.37"

cluster_endpoint_public_access_cidrs = [
  "103.172.4.174/32"
]

node_instance_types = ["t3.medium"]
