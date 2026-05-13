import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const medicalRecords = await ethers.deployContract("MedicalRecords");

  await medicalRecords.waitForDeployment();

  console.log("Contract deployed to:", await medicalRecords.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});