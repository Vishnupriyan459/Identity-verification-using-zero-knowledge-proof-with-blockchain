// This file is MIT Licensed.
// SPDX-License-Identifier: MIT
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x18ddb43b68334746063538997227d156e69f51a1e8f19baed576d3356d4823c7), uint256(0x18a363d398d3c5d10183a7a8ef95719c19e682fe708c54dfaa0bcbff27eebe76));
        vk.beta = Pairing.G2Point([uint256(0x0c62b17cbef381f2e0f49c438ad2a07f1a691ce3e479387b07b076dceeaa2731), uint256(0x1c758fed8d98087948e04af04fe4986e32fe53c64a082f312cd0d32ebc07e274)], [uint256(0x29cc49b352ae2567bd962c968af4e15320ce3475f328e5fc896d9ce6f1b91625), uint256(0x234f73b5c89ab31f62872845eec423e7163fe00e7d5289f4687ba29ecfadc924)]);
        vk.gamma = Pairing.G2Point([uint256(0x304f645d5554ad34c465fa7eed8d3c5a27031851d2f10a05fbe9d72fdb7edb63), uint256(0x205eb321e0685237f46232d5036edfe9a91cdbd9259f81dc5743b7367cbd9808)], [uint256(0x1f1d870036bd008030e04a11a00d029d95737e1b283a22c703f715ee99bc2a02), uint256(0x18c8cc8d0363146b68989fc8497ecd35da6bfa5ddfb826ad1e2293d23582ed77)]);
        vk.delta = Pairing.G2Point([uint256(0x08cace169b2f609466a95f1e52b7508802e9abfe2092fd9a3feccabfd0bde892), uint256(0x13f6cb9fb010c8142b3f8f92910505edd300d429d3f8df08d5591e0f80760e1f)], [uint256(0x010b95db8d4c2c1570910cba46aa1a2945b8673e891e1deca42bdf31975f1377), uint256(0x1d792d6b34c0509038e60cc011205e364bf1fb330901e704652b73dcaeb8a33b)]);
        vk.gamma_abc = new Pairing.G1Point[](8);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x065d0e0dacb044239b8c6414a6f167806f6409560cc85ee009235c0091941998), uint256(0x25bb60f33c941de2c3b4f1dfe681669d6a6757310ec760c6eaf567978f202f4c));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x13959b4dcadc6623cdac93927994588ec8839755b4f229ebafbdc1f821a7f410), uint256(0x04a19faca6b8679692134668e6002042a8b365502f36ce331b49de39d9ea0d18));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x106727c4e4d5c678d1eb9936d61adb14ddd8cbc300118f658ff9744488fde0eb), uint256(0x0a3cff6a0172678fba556cba5a62883fc098421fb14f8c1162e53e2f49d91fb3));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x2501050f6f2c0d1f1c3f945775e9233f5be91167b5757561289ebe62ff3d1a00), uint256(0x1fe5cce6bbb2f25f9b6fba06b958a9ad20af53d59f702682c004d111f7746a97));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x138c31d05ff0c0a89cf686d5d09c41a78f7aa1f7919433c56f7006da4eb2125a), uint256(0x277e499278ce3ae59f441af5abf77be7539056a0103e5a5bade5c1000be0df73));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x0ff6d49d497b4202c1102793c82dab21edbfb5959978e6d4567efc3325ec2fc5), uint256(0x04afa67661b7f0fcc06c332e457090fc8ce9823641accdd9cb2ec117548fde2f));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x24ad4a2df5a2aa12eae3369660eb6b0b2d1528b31cffc32df75a5af56e72ac9c), uint256(0x209c5078d5ad1e3c4739a7a47790a8824dc4bf53941b8706a6541c4b6a6168e1));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x01f5abdb477ccc0ff8d53adac2f9a248c8e8551ec517095b1c04f295ff5e84e5), uint256(0x2fa4539944cb4a65fda2e103555e9671fe6f836f75865d7d71cff812118b6521));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[7] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](7);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
