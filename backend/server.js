require("dotenv").config()

const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const app = express()

const PORT = process.env.PORT || 5000
const EXPIRY_DAYS = 90

app.use(cors())
app.use(express.json())

// ======================================================
// CONFIGURATION
// ======================================================

const REWARDS = {
  "Free Coffee": 300,
  Sandwich: 500,
  Dessert: 700,
  Meal: 1000,
}

const TIERS = {
  Bronze: {
    minLifetimePoints: 0,
    pointsPerRupee: 0.1,
  },

  Silver: {
    minLifetimePoints: 1000,
    pointsPerRupee: 0.2,
  },

  Gold: {
    minLifetimePoints: 3000,
    pointsPerRupee: 0.25,
  },

  Platinum: {
    minLifetimePoints: 5000,
    pointsPerRupee: 0.3,
  },
}

const TIER_ORDER = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
]

// ======================================================
// SIMULATED CLOCK
// ======================================================

let currentTime = new Date()

// ======================================================
// MONGOOSE SCHEMAS
// ======================================================

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    tier: {
      type: String,
      required: true,
      default: "Bronze",
    },

    points: {
      type: Number,
      required: true,
      default: 0,
    },

    lifetimeEarned: {
      type: Number,
      required: true,
      default: 0,
    },

    multiplier: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
)

const pointLotSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    earnedPoints: {
      type: Number,
      required: true,
    },

    remainingPoints: {
      type: Number,
      required: true,
    },

    earnedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    legacy: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const transactionSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    amount: Number,

    rewardName: String,

    points: {
      type: Number,
      required: true,
    },

    pointsCost: Number,

    balanceBefore: {
      type: Number,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    lifetimeEarned: Number,

    tier: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: Date,
  },
  {
    timestamps: true,
  }
)

const outboxSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },

    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    memberName: String,

    fromTier: String,

    toTier: String,

    delivered: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const Member = mongoose.model(
  "Member",
  memberSchema
)

const PointLot = mongoose.model(
  "PointLot",
  pointLotSchema
)

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
)

const Outbox = mongoose.model(
  "Outbox",
  outboxSchema
)

// ======================================================
// HELPERS
// ======================================================

function getTierFromLifetime(lifetimeEarned) {
  if (lifetimeEarned >= 5000) {
    return "Platinum"
  }

  if (lifetimeEarned >= 3000) {
    return "Gold"
  }

  if (lifetimeEarned >= 1000) {
    return "Silver"
  }

  return "Bronze"
}

function getPointsPerRupee(tier) {
  return TIERS[tier].pointsPerRupee
}

function createExpiryDate(date) {
  return new Date(
    date.getTime() +
      EXPIRY_DAYS * 24 * 60 * 60 * 1000
  )
}

function getRewardCost(rewardName) {
  return REWARDS[rewardName]
}

function isTierUpgrade(oldTier, newTier) {
  return (
    TIER_ORDER.indexOf(newTier) >
    TIER_ORDER.indexOf(oldTier)
  )
}

// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "Café Rewards API is running",
    database: "MongoDB",
    currentTime,
  })
})

// ======================================================
// SEARCH MEMBER
// ======================================================

app.get("/api/members/search", async (req, res) => {
  try {
    const { phone } = req.query

    const member = await Member.findOne({ phone })

    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      })
    }

    const earnRate = getPointsPerRupee(
      member.tier
    )

    res.json({
      id: member._id,
      name: member.name,
      phone: member.phone,
      tier: member.tier,
      points: member.points,
      lifetimeEarned: member.lifetimeEarned,
      multiplier: member.multiplier,
      earnRate,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: "Failed to search member",
    })
  }
})

// ======================================================
// GET MEMBER TRANSACTIONS
// ======================================================

app.get(
  "/api/members/:id/transactions",
  async (req, res) => {
    try {
      const member = await Member.findById(
        req.params.id
      )

      if (!member) {
        return res.status(404).json({
          message: "Member not found",
        })
      }

      const memberTransactions =
        await Transaction.find({
          memberId: member._id,
        }).sort({
          createdAt: 1,
        })

      res.json({
        memberId: member._id,
        transactions: memberTransactions,
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        message: "Failed to get transactions",
      })
    }
  }
)

// ======================================================
// RECORD PURCHASE
// ======================================================

app.post(
  "/api/purchases",
  async (req, res) => {
    try {
      const { memberId, amount } = req.body

      if (
        !memberId ||
        amount === undefined ||
        Number(amount) <= 0
      ) {
        return res.status(400).json({
          message:
            "Valid member ID and purchase amount are required",
        })
      }

      const member =
        await Member.findById(memberId)

      if (!member) {
        return res.status(404).json({
          message: "Member not found",
        })
      }

      const purchaseAmount = Number(amount)

      // Current tier determines this purchase's rate.
      const earnRate = getPointsPerRupee(
        member.tier
      )

      const pointsEarned = Math.floor(
        purchaseAmount * earnRate
      )

      const balanceBefore = member.points

      // Update current balance.
      member.points += pointsEarned

      // Lifetime earned never decreases.
      member.lifetimeEarned += pointsEarned

      // Create a point lot.
      const lot = await PointLot.create({
        memberId: member._id,
        earnedPoints: pointsEarned,
        remainingPoints: pointsEarned,
        earnedAt: new Date(currentTime),
        expiresAt: createExpiryDate(currentTime),
        legacy: false,
      })

      // Check tier upgrade.
      const oldTier = member.tier

      const newTier = getTierFromLifetime(
        member.lifetimeEarned
      )

      if (
        newTier !== oldTier &&
        isTierUpgrade(oldTier, newTier)
      ) {
        member.tier = newTier

        await Outbox.create({
          event: "TIER_UPGRADED",
          memberId: member._id,
          memberName: member.name,
          fromTier: oldTier,
          toTier: newTier,
          delivered: false,
          createdAt: new Date(currentTime),
        })
      }

      await member.save()

      // Record transaction.
      await Transaction.create({
        memberId: member._id,
        type: "PURCHASE",
        amount: purchaseAmount,
        points: pointsEarned,
        balanceBefore,
        balanceAfter: member.points,
        lifetimeEarned:
          member.lifetimeEarned,
        tier: member.tier,
        createdAt: new Date(currentTime),
        expiresAt: lot.expiresAt,
      })

      res.json({
        message:
          "Purchase recorded successfully",

        purchase: {
          memberId: member._id,
          amount: purchaseAmount,
          pointsEarned,
          balanceBefore,
          balanceAfter: member.points,
          lifetimeEarned:
            member.lifetimeEarned,
          tier: member.tier,
          earnRate,
          expiresAt: lot.expiresAt,
        },
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        message: "Failed to record purchase",
        error: error.message,
      })
    }
  }
)

// ======================================================
// REDEEM REWARD
// ======================================================

app.post(
  "/api/redemptions",
  async (req, res) => {
    try {
      const {
        memberId,
        rewardName,
      } = req.body

      if (!memberId || !rewardName) {
        return res.status(400).json({
          message:
            "Valid member ID and reward name are required",
        })
      }

      const member =
        await Member.findById(memberId)

      if (!member) {
        return res.status(404).json({
          message: "Member not found",
        })
      }

      // Backend decides reward cost.
      const cost =
        getRewardCost(rewardName)

      if (!cost) {
        return res.status(400).json({
          message: "Invalid reward",
        })
      }

      if (member.points < cost) {
        return res.status(400).json({
          message: "Insufficient points",
        })
      }

      const balanceBefore = member.points

      let remainingToRedeem = cost

      // FIFO:
      // oldest usable points are consumed first.
      const memberLots =
        await PointLot.find({
          memberId: member._id,
          remainingPoints: {
            $gt: 0,
          },
        }).sort({
          earnedAt: 1,
        })

      for (const lot of memberLots) {
        if (remainingToRedeem <= 0) {
          break
        }

        const amountFromLot =
          Math.min(
            lot.remainingPoints,
            remainingToRedeem
          )

        lot.remainingPoints -=
          amountFromLot

        remainingToRedeem -=
          amountFromLot

        await lot.save()
      }

      member.points -= cost

      // Lifetime earned does NOT decrease.
      await member.save()

      await Transaction.create({
        memberId: member._id,
        type: "REDEMPTION",
        rewardName,
        points: -cost,
        pointsCost: cost,
        balanceBefore,
        balanceAfter: member.points,
        lifetimeEarned:
          member.lifetimeEarned,
        tier: member.tier,
        createdAt: new Date(currentTime),
      })

      res.json({
        message:
          "Reward redeemed successfully",

        redemption: {
          memberId: member._id,
          rewardName,
          pointsCost: cost,
          balanceBefore,
          balanceAfter: member.points,
          lifetimeEarned:
            member.lifetimeEarned,
          tier: member.tier,
        },
      })
    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          "Failed to redeem reward",
        error: error.message,
      })
    }
  }
)

// ======================================================
// EXPIRE STALE POINTS
// ======================================================

async function expirePoints() {
  let totalExpired = 0

  const expiredTransactions = []

  const members =
    await Member.find({})

  for (const member of members) {
    const expiredLots =
      await PointLot.find({
        memberId: member._id,

        remainingPoints: {
          $gt: 0,
        },

        legacy: false,

        expiresAt: {
          $ne: null,
          $lte: currentTime,
        },
      })

    for (const lot of expiredLots) {
      const expiredPoints =
        lot.remainingPoints

      if (expiredPoints <= 0) {
        continue
      }

      const balanceBefore =
        member.points

      member.points -= expiredPoints

      lot.remainingPoints = 0

      await lot.save()

      await member.save()

      totalExpired += expiredPoints

      const transaction =
        await Transaction.create({
          memberId: member._id,
          type: "EXPIRY",
          points: -expiredPoints,
          balanceBefore,
          balanceAfter: member.points,
          lifetimeEarned:
            member.lifetimeEarned,
          tier: member.tier,
          createdAt: new Date(
            currentTime
          ),
          expiresAt: lot.expiresAt,
        })

      expiredTransactions.push(
        transaction
      )
    }
  }

  return {
    totalExpired,
    expiredTransactions,
  }
}

// ======================================================
// CLOCK
// ======================================================

app.post("/clock", async (req, res) => {
  try {
    const {
      now,
      advanceDays,
    } = req.body || {}

    if (now) {
      const newTime = new Date(now)

      if (
        Number.isNaN(
          newTime.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid clock time",
        })
      }

      currentTime = newTime
    } else if (
      advanceDays !== undefined
    ) {
      const days =
        Number(advanceDays)

      if (!Number.isFinite(days)) {
        return res.status(400).json({
          message:
            "advanceDays must be a number",
        })
      }

      currentTime = new Date(
        currentTime.getTime() +
          days *
            24 *
            60 *
            60 *
            1000
      )
    } else {
      currentTime = new Date()
    }

    const expiryResult =
      await expirePoints()

    res.json({
      message:
        "Clock updated successfully",

      currentTime,

      totalExpired:
        expiryResult.totalExpired,

      expiredTransactions:
        expiryResult.expiredTransactions,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message:
        "Clock operation failed",
      error: error.message,
    })
  }
})

// ======================================================
// OUTBOX
// ======================================================

app.get("/outbox", async (req, res) => {
  try {
    const events =
      await Outbox.find({}).sort({
        createdAt: 1,
      })

    res.json({
      count: events.length,
      events,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message:
        "Failed to fetch outbox",
    })
  }
})

// ======================================================
// REWARDS
// ======================================================

app.get("/api/rewards", (req, res) => {
  res.json(REWARDS)
})

// ======================================================
// DATABASE SEED
// ======================================================
//
// Creates Rahul only if the database is empty.
//

async function seedDatabase() {
  const memberCount =
    await Member.countDocuments()

  if (memberCount > 0) {
    console.log(
      "Existing members found. Skipping seed."
    )
    return
  }

  const member =
    await Member.create({
      name: "Rahul Sharma",
      phone: "9876543210",
      tier: "Gold",
      points: 1275,
      lifetimeEarned: 3000,
      multiplier: 1.5,
    })

  // Legacy points.
  // They do not expire.
  const legacyLot =
    await PointLot.create({
      memberId: member._id,
      earnedPoints: 1275,
      remainingPoints: 1275,
      earnedAt: null,
      expiresAt: null,
      legacy: true,
    })

  await Transaction.create({
    memberId: member._id,
    type: "INITIAL_BALANCE",
    points: 1275,
    balanceBefore: 0,
    balanceAfter: 1275,
    lifetimeEarned: 3000,
    tier: "Gold",
    createdAt: new Date(
      currentTime.getTime() -
        30 *
          24 *
          60 *
          60 *
          1000
    ),
  })

  console.log(
    "Database seeded with Rahul Sharma"
  )

  console.log(
    "Legacy lot:",
    legacyLot._id
  )
}

// ======================================================
// START SERVER
// ======================================================

async function startServer() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    )

    console.log(
      "MongoDB connected successfully"
    )

    await seedDatabase()

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      )
    })
  } catch (error) {
    console.error(
      "MongoDB connection failed:"
    )

    console.error(error.message)

    process.exit(1)
  }
}

startServer()