import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying Spark-X contracts...');

  // Deploy AnalyticsRegistry contract
  const AnalyticsRegistry = await ethers.getContractFactory('AnalyticsRegistry');
  const analyticsRegistry = await AnalyticsRegistry.deploy();
  await analyticsRegistry.waitForDeployment();

  const analyticsRegistryAddress = await analyticsRegistry.getAddress();
  console.log(`AnalyticsRegistry deployed to: ${analyticsRegistryAddress}`);

  // Deploy PrivacyManager contract
  const PrivacyManager = await ethers.getContractFactory('PrivacyManager');
  const privacyManager = await PrivacyManager.deploy(analyticsRegistryAddress);
  await privacyManager.waitForDeployment();

  const privacyManagerAddress = await privacyManager.getAddress();
  console.log(`PrivacyManager deployed to: ${privacyManagerAddress}`);

  console.log('Deployment complete!');

  // Return the deployed contract addresses for potential scripting use
  return {
    analyticsRegistry: analyticsRegistryAddress,
    privacyManager: privacyManagerAddress,
  };
}

// Execute the deployment
main()
  .then(deployedContracts => {
    console.log('Contracts deployed successfully!');
    console.log(JSON.stringify(deployedContracts, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
