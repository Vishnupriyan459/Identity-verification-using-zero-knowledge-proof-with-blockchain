// This file is MIT Licensed.
//// SPDX-License-Identifier: MIT
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
        vk.alpha = Pairing.G1Point(uint256(0x2c3e38c85c9f2126aaede215d150d40c653ef8d75428964b9ab549ad25eedcd1), uint256(0x0fd1d8b847a536ccb5ccf9e536171ba3743f38d2a46b893a33550a6d4a5c13c9));
        vk.beta = Pairing.G2Point([uint256(0x2193f15b85a5e2e15f951edd4be6ce9dc7ec32b770354e6bedc0125de442711a), uint256(0x03b7d3eb38f1a7d90dcf25b2466cfc3ee872c223cdbeada66a4d8dfeee4c742a)], [uint256(0x2d6c06025bf19615bb53476853933dd00a98f1d4081b398d8bf136b3ee349742), uint256(0x23026fbcf4796004330e80317b9226487cfc8eaee73d8bf3c1c9c1e458f4f6c9)]);
        vk.gamma = Pairing.G2Point([uint256(0x1c33d58d69d9b94f40f1b51dc8e18a8076c084cfe2757f2b297680c64865ab64), uint256(0x04a3752abb8d0f415c92fecb7af899e76019b6a879e2705ebf3c2dfd080c3368)], [uint256(0x058c44cfffd382a05db39d52d25dd6423a577341acf0b70e07e8cad13b3c6ff1), uint256(0x12ecc2f225bba6e758d0d178eeee39a56f6b05236e4db8be8e02863c474d10b0)]);
        vk.delta = Pairing.G2Point([uint256(0x162886913319d626d047b181566a3fe041b26914ba18f7fa952c2d70e9a1e432), uint256(0x1d8543eff7f0d3e0f514157bca592860d58e43f2744885c1c493e5670b1a41c0)], [uint256(0x0d6a0758389d1e676a92b205feae6b4ce23271571381613e4fcb280788a4c7e9), uint256(0x0eabb8afda461fb07020a534605d7422d1440dd18ccba2a25bc66e436d5a1902)]);
        vk.gamma_abc = new Pairing.G1Point[](17);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x0cecfd6ea05d707e074e681b63bfde904309c9b7968522d1c2a35961b88f8b21), uint256(0x19403604adc180d724c736d19d83a5650f84492ffa5b003ddc7c1c118f581db8));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x03d2b299f00263b9b4de74ce7f92ba2727a5f1d287b76d42978ffccc94f280dc), uint256(0x23819b9929ed7f7cd1b183d0057863587d9b58de20dc52bae78f10430c1b033c));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x0920cc8dd9b28d964a21f5879e0eccdbde4eaba3ae5b011b0bf5277b12464084), uint256(0x038da4704a2528fc63b4b1c92b2570c3b026e345555bbb74140e32a279663102));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x18e2b65ac8123a363883cbcd8c64be2f3707797fb31c817e82fd89a937b9cb56), uint256(0x189a64506961249a1462d5243c0886d7b0d396058d10cfc194f2cd83742c9ebb));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x160417b0e9e603046da4b95c203a60aacbb56a052ea143ee66b2f3848b95f99b), uint256(0x101a0f108c2bd0428a7c8d5b74ef7a3079dc93dc79449ce754ad3638f152b817));
        vk.gamma_abc[5] = Pairing.G1Point(uint256(0x20610d51e159f1e84d539b66b5a1fbc31997f3892ebc86029a15886f144e5454), uint256(0x152df36ea61d4ce4e8daab92bd145244c4eeaf61825fe56417e75de28805f2eb));
        vk.gamma_abc[6] = Pairing.G1Point(uint256(0x0edb2f06a8c16126211e4affa187da4ad62ac0f2d11fe121db5b296fc6fb6bc3), uint256(0x182c8804cd6c540375a4a43589824743708b9973e19ab509e2a913bc70cf26ce));
        vk.gamma_abc[7] = Pairing.G1Point(uint256(0x0d8b2eba6ebd9a1e44cf57eba883d148027029c112d3465fea2cf989b9f204cd), uint256(0x2e9d0fd1160093ca4b3d4ad53c3a87bf9a1b46551972ce696b0053e73b4ecade));
        vk.gamma_abc[8] = Pairing.G1Point(uint256(0x2f6fbfef3398356f5e55274f54a8e285ccab94565ae0c3cc81c4586f5e03dec1), uint256(0x28e82ebd536a8735846a40f7f694600128b46df68d0fb0d17fac271cf3c538da));
        vk.gamma_abc[9] = Pairing.G1Point(uint256(0x0d3559fc79df491d9d48277a7fc301e624575c95bf1ed306f4bb3e075c7cb31c), uint256(0x2c48152fc80fd9bfe3dda119995bc6d41621e54e15d40d333e979c12c47b578c));
        vk.gamma_abc[10] = Pairing.G1Point(uint256(0x2863336d3d804e1048d81417ff00aabd2703834f7d3b410112f916dc8dda0e69), uint256(0x0be919df662427418874556e19fe1f5286c00533443d602a15d6f141fcb4ea5e));
        vk.gamma_abc[11] = Pairing.G1Point(uint256(0x27e3ca27f3fc02b47949668f95aaee940b0b9cf364ab389bae3c1550845f4a48), uint256(0x2d082ff0adf7e893dc6fc927fbaed8d5bb9ae7a4013d9272ee1da93f04028ada));
        vk.gamma_abc[12] = Pairing.G1Point(uint256(0x06aef24b52296ac6da652f24364de5e13a206bf8ef96bf26beb3efd58091deeb), uint256(0x08a80ba22c05188b75d6b04e839333e4e972fe348212b9e515e48d3290431593));
        vk.gamma_abc[13] = Pairing.G1Point(uint256(0x053e820cebdb18d13b0981350abe70acc6cfdb1d090ff44af4ccd96c5d719373), uint256(0x1fc0e2a973df0128697402315bef6f76a3f24af7578fbb818acbc3d903fd3597));
        vk.gamma_abc[14] = Pairing.G1Point(uint256(0x24f66c2926d7f523f3448144177958bdc1aac99a300a31e3bb45dd72ed236dbf), uint256(0x0ea4060f83eda8c29149e0b7a1b28bb490ba198f4e847212b5c38af1cea4b21c));
        vk.gamma_abc[15] = Pairing.G1Point(uint256(0x1d67f60d728830adf250be8c0aea251c30d845c2416fe3302199315da6002a43), uint256(0x00e1ec04ba6b849e339d0b5520cf1df95e8f82a435de5f113b8a5ab89eb10933));
        vk.gamma_abc[16] = Pairing.G1Point(uint256(0x27968757f92890d3b16b4bb3e44f36652b87cd467861b72f5a46d96ffb06c670), uint256(0x1c37335de86b5109b2278f207309cba3a90a5f6cb4a8a315928607c3022efdfa));
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
            Proof memory proof, uint[16] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](16);
        
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
