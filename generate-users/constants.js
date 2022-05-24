module.exports = {
    USERS_SCORE_RANGE: [
        [0, 200000], // with probablity 0.1
        [200001, 400000], // with probablity 0.25
        [400001, 700000], // with probablity 0.40
        [700001, 900000], // with probablity 0.15
        [900001, 950000], // with probablity 0.05
        [950001, 970000], // with probablity 0.035
        [970001, 990000], // with probablity 0.01
        [990001, 1000000] // with probablity 0.005
    ],
    USERS_SCORE_RANGE_PROBABILITIES: [0.1, 0.25, 0.4, 0.15, 0.05, 0.035, 0.01, 0.005],

    USERS_INDEXES_RANGE: [
        [0, 9], // with probablity 0.3
        [10, 49], // with probablity 0.2
        [50, 99], // with probablity 0.1
        [100, 699], // with probablity 0.15
        [700, 2999], // with probablity 0.15
        [3000, 7999], // with probablity 0.07
        [8000, 9999], // with probablity 0.03
    ],
    USERS_INDEXES_RANGE_PROBABILITIES: [0.3, 0.2, 0.1, 0.15, 0.15, 0.07, 0.03]
}