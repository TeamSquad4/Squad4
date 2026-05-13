import json
import os

try:
    from web3 import Web3
except ImportError:
    Web3 = None


BLOCKCHAIN_ENABLED = os.getenv("BLOCKCHAIN_ENABLED", "false").lower() == "true"
RPC_URL = os.getenv("BLOCKCHAIN_RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv(
    "CONTRACT_ADDRESS",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
)


def get_contract():
    if not BLOCKCHAIN_ENABLED:
        return None, None

    if Web3 is None:
        raise RuntimeError("web3 is not installed. Run: pip install web3")

    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        raise RuntimeError("Blockchain node is not running")

    with open("app/blockchain/contract_abi.json") as f:
        contract_abi = json.load(f)

    contract = w3.eth.contract(
        address=CONTRACT_ADDRESS,
        abi=contract_abi
    )

    return w3, contract


def store_hash(patient_id: str, file_hash: str):
    if not BLOCKCHAIN_ENABLED:
        return None

    w3, contract = get_contract()

    account = w3.eth.accounts[0]

    tx_hash = contract.functions.addRecord(
        patient_id,
        file_hash
    ).transact({
        "from": account
    })

    return tx_hash.hex()


def get_record(index: int):
    w3, contract = get_contract()
    if contract is None:
        return None
    return contract.functions.getRecord(index).call()


def get_total_records():
    w3, contract = get_contract()
    if contract is None:
        return 0
    return contract.functions.getTotalRecords().call()