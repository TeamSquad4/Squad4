// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalRecords {

    struct Record {
        string patientId;
        string fileHash;
        uint timestamp;
    }

    Record[] public records;

    function addRecord(string memory patientId, string memory fileHash) public {
        records.push(Record(patientId, fileHash, block.timestamp));
    }

    function getRecord(uint index) public view returns (
        string memory,
        string memory,
        uint
    ) {
        Record memory r = records[index];
        return (r.patientId, r.fileHash, r.timestamp);
    }

    function getTotalRecords() public view returns (uint) {
        return records.length;
    }
}