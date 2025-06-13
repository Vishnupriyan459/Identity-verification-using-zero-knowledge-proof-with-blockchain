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
        vk.alpha = Pairing.G1Point(uint256(0x10790c9702242efc980e42b037929c3d871d5c9617b4dad3e28ad01fc2ba1305), uint256(0x156b11bb475396cabc239819192aaa5a6bc7342cda29b7b402b985f0c6ce23d2));
        vk.beta = Pairing.G2Point([uint256(0x2831ac139107617f7063a3d0f66e990b5d42c0fd93c5912037cce39f562745ab), uint256(0x2413097332ce5c969b5e13a8c26fc9b75db00049fc2692643a57e4762d19cb38)], [uint256(0x027beb1a549695ad0c3500db5033fc4341125adc363191d101c35936c6ef6420), uint256(0x276f870d65bb9167f09fbdb181bbecf12b293e6e23e166bac2d808ca7030f38c)]);
        vk.gamma = Pairing.G2Point([uint256(0x2c4ffcd5e177e28e95c5b37a456ba306bdcc57ea6b8634bffab0ae4b24124add), uint256(0x1eb63c84cf6626cf1140facee4dc1548eccbf1c642c343ddc75efcd06fde04b7)], [uint256(0x0619015c1b401a9a7259dd303addff73a037cc362e2b1a7509c57756355e5a2b), uint256(0x1a33db40c3b186b1f7c8e49810f5b8a54a19a02755b6cdd01e4c909e686df3bf)]);
        vk.delta = Pairing.G2Point([uint256(0x17be72d2abe52cf2af0f199e2d95ae5eee2758847bc9e24bb4cd51cbb6066769), uint256(0x2dee933ad7df3477d99d0b5082dac92dab9cdd53e2fde94999306c1faf94ebd2)], [uint256(0x1dfdb6565c65d5ede4b81955d6faca020f249aa56f88711f20921acc717a97f7), uint256(0x12383e2b121ece201fcdbe6cc2531b6d1d0d6ec42c7c6949cba59ca74c715d22)]);
        vk.gamma_abc = new Pairing.G1Point[](14);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x2722d78141c9d2ff61cd11ff48d8fa675e84dd45444db8b27ee6f340e0202006), uint256(0x06d0b0219becdf2b986237c24ea1d89f23dc812bd3be78de7bf8b8b49349738a));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x18419eb94cbfb901d72cd304d7fa0f385ffbcd7e91da9ba5d451b8023a9ee8ca), uint256(0x210498c2be8bc25a093f48553e7b98cf3e2ac89139eef9c3523eeb82520c0f34));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x07070dbff5e987d1af5b5d97ef5c9af8965b8d197788f9a9841f5e1a4f4e78e9), uint256(0x2e1a5a6b2e53e42da81c8f3bb82b6ca28fdaa95fd3c5f2a0e14e7e32be9b9b0f));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x054be7e3a92cb8fe7d982d239e44682bfe5400608bd1f0a8903e2715714a60ac), uint256(0x1b45120ac54973c194f03bce86c32b5bcb4ad66eaaa58196d29aa28d5f758b15));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x1b4f70281c3fa2bc49dfb5777ef76f2ddeb0c64e83273ae7c65056aa9a0b1edf), uint256(0x0da44c4bb55283882d760437bab8d4c6dd384e92ca27a654f504a892417ed6fb));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x29f67ec3c501e2c806d2aaf9a3cf3cfcea947a8cf9243cc1edfc6e5d579b6a80), uint256(0x10b38ce4b0fad374439e0c4862a05bbf51c947e944a9efc0c390a69f7a7abb27));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x00b13cf7ef671b210b71db30477a3c4c0873ab2bde91ad7a847ad0c0b01ddcdd), uint256(0x30579ced5c781110c09ff114961b74e2b7b918b184c5de6e50803791b6359eec));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x1f9758f0f155fbf851183ba5e83e94e3d93c2913a750b9d52fd1cd907e1d82d8), uint256(0x0840e1118ba51530784487c5c61e758cc6948e6da289c10727e451e4e6df1909));
        vk.gamma_abc[8] = Pairing.G1Point(uint256(0x0db27ca97e6f57386d383034e9904078767667de26e0444d7483145ad99cbb2a), uint256(0x0821f3518e2646ede625f0068ecc2ed99f4e54f29816a65e368588df517b55e9));
        vk.gamma_abc[9] = Pairing.G1Point(uint256(0x0801b40a71bdaf7d50f60ec68efc04831383062168d0233554ad828a5d7dd94a), uint256(0x0d5113ccdaad61286e34377a96e9d36584aa49f887464c7c1aa624c9ec55805b));
        vk.gamma_abc[10] = Pairing.G1Point(uint256(0x004a89bc47ffd68e0b3429685606b5201e2cffbd411c838e7a90b191f6200373), uint256(0x1b54dccfa3e6daca1adccbd9d08011d0a009f4a1d627841adc71d5674663f8d7));
        vk.gamma_abc[11] = Pairing.G1Point(uint256(0x25891a72b6dbf294dfc5d443a10258ccc19e03d0f05265fbe7a269550197e3e4), uint256(0x076af035b109193551bd04a2fc7de02acdbb2ed6ec7f745a15d0540bce98badf));
        vk.gamma_abc[12] = Pairing.G1Point(uint256(0x2100d7559e31851b2e49d508e08407e4a72d742776d8498fb0b962017e83549c), uint256(0x2751b4c598f9a4b9039eb1c1200f634a2fa88841a2d4bd1c68b5cb03dcd2d4a9));
        vk.gamma_abc[13] = Pairing.G1Point(uint256(0x1e2a7d620df3c87b9824327a32df1d379e259500748b5247f5852e01d7760c20), uint256(0x042db74d9b532e1a0620dfd3c475e63dad0e207399460f2558b6f0594ac6a92f));
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
            Proof memory proof, uint[13] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](13);
        
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
