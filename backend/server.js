const express = require("express")
const cors = require("cors")

const app = express()

const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())

// Temporary member data
let members = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "9876543210",
    tier: "Gold",
    multiplier: 1.5,
    points: 1275,
  },
]

// -------------------------------------
// Home route
// -------------------------------------
app.get("/", (req, res) => {
  res.json({
    message: "Café Rewards API is running",
  })
})

// -------------------------------------
// Search member by phone
// -------------------------------------
app.get("/api/members/search", (req, res) => {
  const { phone } = req.query

  const member = members.find(
    (member) => member.phone === phone
  )

  if (!member) {
    return res.status(404).json({
      message: "Member not found",
    })
  }

  res.json(member)
})

// -------------------------------------
// Record purchase and add points
// -------------------------------------
app.post("/api/purchases", (req, res) => {
  const { memberId, amount } = req.body

  if (!memberId || !amount || amount <= 0) {
    return res.status(400).json({
      message: "Valid member ID and purchase amount are required",
    })
  }

  const member = members.find(
    (member) => member.id === Number(memberId)
  )

  if (!member) {
    return res.status(404).json({
      message: "Member not found",
    })
  }

  // ₹10 = 1 base point
  // Gold = 1.5x
  const pointsEarned = Math.floor(
    (Number(amount) / 10) * member.multiplier
  )

  const balanceBefore = member.points

  member.points += pointsEarned

  res.json({
    message: "Purchase recorded successfully",
    purchase: {
      memberId: member.id,
      amount: Number(amount),
      pointsEarned,
      balanceBefore,
      balanceAfter: member.points,
    },
  })
})

// -------------------------------------
// Redeem reward
// -------------------------------------
app.post("/api/redemptions", (req, res) => {
  const { memberId, rewardName, pointsCost } = req.body

  if (!memberId || !rewardName || !pointsCost || pointsCost <= 0) {
    return res.status(400).json({
      message:
        "Valid member ID, reward name and points cost are required",
    })
  }

  const member = members.find(
    (member) => member.id === Number(memberId)
  )

  if (!member) {
    return res.status(404).json({
      message: "Member not found",
    })
  }

  const cost = Number(pointsCost)

  if (member.points < cost) {
    return res.status(400).json({
      message: "Insufficient points",
    })
  }

  const balanceBefore = member.points

  member.points -= cost

  res.json({
    message: "Reward redeemed successfully",
    redemption: {
      memberId: member.id,
      rewardName,
      pointsCost: cost,
      balanceBefore,
      balanceAfter: member.points,
    },
  })
})

// -------------------------------------
// Start server
// -------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})