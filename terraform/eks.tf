
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.26.0"

  name               = var.cluster_name
  kubernetes_version = var.kubernetes_version

  # Use the existing VPC and private subnets
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Kubernetes API access
  endpoint_public_access  = true
  endpoint_private_access = true

  endpoint_public_access_cidrs = var.cluster_endpoint_public_access_cidrs

  # Give the IAM identity running Terraform admin access
  enable_cluster_creator_admin_permissions = true

  # Required EKS networking and DNS add-ons
  addons = {
    coredns = {}

    kube-proxy = {}

    vpc-cni = {
      before_compute = true
    }

    eks-pod-identity-agent = {
      before_compute = true
    }
  }

  # EKS managed worker nodes
  eks_managed_node_groups = {
    general = {
      name = "fullstack-devops-workers"

      # Fix IAM role name length issue
      iam_role_name            = "fsdevops-eks-workers"
      iam_role_use_name_prefix = false

      ami_type       = "AL2023_x86_64_STANDARD"
      instance_types = var.node_instance_types
      capacity_type  = "ON_DEMAND"

      min_size     = 1
      max_size     = 2
      desired_size = 2

      subnet_ids = module.vpc.private_subnets

      disk_size = 20
    }
  }
  tags = {
    Project     = var.project_name
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}
