import { useState } from "react"

function App() {
 
  // Member State
 
  const [phone, setPhone] = useState("")
  const [member, setMember] = useState(null)
  const [message, setMessage] = useState("")

 
  // Purchase State
  
  const [purchaseAmount, setPurchaseAmount] = useState("")

  // -----------------------------
  // Reward State
  // -----------------------------
  const [rewardCost, setRewardCost] = useState(300)
  const [rewardName, setRewardName] = useState("Free Coffee")

  // -----------------------------
  // Transaction State
  // -----------------------------
  const [transactions, setTransactions] = useState([
    {
      type: "Purchase",
      description: "₹500 purchase",
      points: 75,
      balance: 1275,
    },
    {
      type: "Redemption",
      description: "Free Coffee",
      points: -300,
      balance: 1200,
    },
  ])

  // -----------------------------
  // Search Member
  // -----------------------------
  const searchMember = () => {
    if (phone.trim() === "9876543210") {
      setMember({
        name: "Rahul Sharma",
        phone: "9876543210",
        tier: "Gold",
        points: 1275,
        multiplier: 1.5,
      })

      setMessage("")
    } else {
      setMember(null)
      setMessage("Member not found. Try 9876543210")
    }
  }

  // -----------------------------
  // Record Purchase
  // -----------------------------
  const addPurchase = () => {
    if (!member) {
      setMessage("Please search for a member first.")
      return
    }

    const amount = Number(purchaseAmount)

    if (!amount || amount <= 0) {
      setMessage("Please enter a valid purchase amount.")
      return
    }

    // Example:
    // ₹10 = 1 base point
    // Gold = 1.5x
    const earnedPoints = Math.floor((amount / 10) * member.multiplier)

    const newBalance = member.points + earnedPoints

    setMember({
      ...member,
      points: newBalance,
    })

    setTransactions([
      {
        type: "Purchase",
        description: `₹${amount} purchase`,
        points: earnedPoints,
        balance: newBalance,
      },
      ...transactions,
    ])

    setPurchaseAmount("")
    setMessage(
      `Purchase recorded successfully! +${earnedPoints} points added.`
    )
  }

  // -----------------------------
  // Redeem Reward
  // -----------------------------
  const redeemReward = () => {
    if (!member) {
      setMessage("Please search for a member first.")
      return
    }

    if (member.points < rewardCost) {
      setMessage("Insufficient points for this reward.")
      return
    }

    const newBalance = member.points - rewardCost

    setMember({
      ...member,
      points: newBalance,
    })

    setTransactions([
      {
        type: "Redemption",
        description: rewardName,
        points: -rewardCost,
        balance: newBalance,
      },
      ...transactions,
    ])

    setMessage(
      `${rewardName} redeemed successfully! -${rewardCost} points.`
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Sidebar */}
      <div className="flex min-h-screen">

        <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col p-6">

          <div>

            <div className="flex items-center gap-3 mb-10">

              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-xl">
                ☕
              </div>

              <div>
                <h1 className="font-bold text-lg">
                  BrewRewards
                </h1>

                <p className="text-xs text-slate-400">
                  Café Management
                </p>
              </div>

            </div>

            <nav className="space-y-2">

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500 text-slate-950 font-semibold">
                <span>▦</span>
                Dashboard
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800">
                <span>👥</span>
                Members
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800">
                <span>🎁</span>
                Rewards
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800">
                <span>📊</span>
                Transactions
              </button>

            </nav>

          </div>

          <div className="mt-auto bg-slate-800 rounded-xl p-4">

            <p className="text-xs text-slate-400">
              Logged in as
            </p>

            <p className="font-semibold mt-1">
              Café Staff
            </p>

          </div>

        </aside>

        {/* Main Content */}
        <main className="flex-1">

          {/* Header */}
          <header className="border-b border-slate-800 px-6 md:px-10 py-5 flex justify-between items-center">

            <div>

              <h2 className="text-2xl font-bold">
                Rewards Dashboard
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Manage members, purchases and rewards
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden sm:block text-right">

                <p className="text-sm font-semibold">
                  Today
                </p>

                <p className="text-xs text-slate-400">
                  Café Counter
                </p>

              </div>

              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                CS
              </div>

            </div>

          </header>

          <div className="p-6 md:p-10">

            {/* Search */}
            <section className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 md:p-8 shadow-xl">

              <div className="max-w-2xl">

                <p className="text-sm font-semibold text-amber-950">
                  MEMBER LOOKUP
                </p>

                <h3 className="text-2xl md:text-3xl font-bold text-slate-950 mt-1">
                  Find a member
                </h3>

                <p className="text-amber-950/80 mt-2 text-sm">
                  Search using the member's registered phone number.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">

                  <input
                    type="text"
                    placeholder="Enter phone number..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        searchMember()
                      }
                    }}
                    className="flex-1 px-5 py-3.5 rounded-xl bg-white text-slate-800 outline-none focus:ring-4 focus:ring-white/30"
                  />

                  <button
                    onClick={searchMember}
                    className="px-7 py-3.5 rounded-xl bg-slate-950 text-white font-semibold hover:bg-slate-800 transition"
                  >
                    Search Member
                  </button>

                </div>

                {/* Search Message */}
                {message && (
                  <div className="mt-4 bg-slate-950/90 text-white rounded-xl px-4 py-3 text-sm">
                    {message}
                  </div>
                )}

              </div>

            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-7">

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-slate-400 text-sm">
                  Total Members
                </p>

                <div className="flex justify-between items-end mt-3">

                  <h3 className="text-3xl font-bold">
                    1,248
                  </h3>

                  <span className="text-green-400 text-sm">
                    +12%
                  </span>

                </div>

              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-slate-400 text-sm">
                  Points Issued
                </p>

                <div className="flex justify-between items-end mt-3">

                  <h3 className="text-3xl font-bold">
                    84.2K
                  </h3>

                  <span className="text-green-400 text-sm">
                    +8%
                  </span>

                </div>

              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-slate-400 text-sm">
                  Rewards Redeemed
                </p>

                <div className="flex justify-between items-end mt-3">

                  <h3 className="text-3xl font-bold">
                    326
                  </h3>

                  <span className="text-amber-400 text-sm">
                    This month
                  </span>

                </div>

              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-slate-400 text-sm">
                  Active Members
                </p>

                <div className="flex justify-between items-end mt-3">

                  <h3 className="text-3xl font-bold">
                    892
                  </h3>

                  <span className="text-green-400 text-sm">
                    71.5%
                  </span>

                </div>

              </div>

            </section>

            {/* Member Section */}
            <section className="grid lg:grid-cols-3 gap-6 mt-7">

              {/* Member Card */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">

                {member ? (

                  <>
                    <div className="flex justify-between items-start">

                      <div className="flex gap-4">

                        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-bold">
                          {member.name
                            .split(" ")
                            .map((name) => name[0])
                            .join("")}
                        </div>

                        <div>

                          <h3 className="text-xl font-bold">
                            {member.name}
                          </h3>

                          <p className="text-slate-400 text-sm mt-1">
                            📱 {member.phone}
                          </p>

                        </div>

                      </div>

                      <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-semibold">
                        ★ {member.tier} Member
                      </span>

                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-7">

                      <div className="bg-slate-800 rounded-xl p-5">

                        <p className="text-slate-400 text-sm">
                          Available Points
                        </p>

                        <h4 className="text-4xl font-bold mt-2 text-amber-400">
                          {member.points.toLocaleString()}
                        </h4>

                        <p className="text-xs text-slate-500 mt-2">
                          Points available for redemption
                        </p>

                      </div>

                      <div className="bg-slate-800 rounded-xl p-5">

                        <p className="text-slate-400 text-sm">
                          Points Multiplier
                        </p>

                        <h4 className="text-4xl font-bold mt-2">
                          {member.multiplier}×
                        </h4>

                        <p className="text-xs text-slate-500 mt-2">
                          {member.tier} tier earning rate
                        </p>

                      </div>

                    </div>
                  </>

                ) : (

                  <div className="text-center py-12">

                    <div className="text-5xl mb-4">
                      👤
                    </div>

                    <h3 className="text-xl font-bold">
                      No Member Selected
                    </h3>

                    <p className="text-slate-400 text-sm mt-2">
                      Search for a member using their phone number.
                    </p>

                  </div>

                )}

              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <h3 className="text-lg font-bold">
                  Quick Actions
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Manage member activity
                </p>

                <div className="space-y-3 mt-6">

                  <button
                    onClick={() => {
                      document
                        .getElementById("purchase")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="w-full bg-green-500 text-slate-950 font-semibold py-3.5 rounded-xl hover:bg-green-400 transition"
                  >
                    + Record Purchase
                  </button>

                  <button
                    onClick={() => {
                      document
                        .getElementById("redeem")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="w-full bg-purple-500 text-white font-semibold py-3.5 rounded-xl hover:bg-purple-400 transition"
                  >
                    🎁 Redeem Reward
                  </button>

                  <button
                    onClick={() => {
                      document
                        .getElementById("transactions")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="w-full border border-slate-700 text-slate-300 font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition"
                  >
                    View Transactions
                  </button>

                </div>

              </div>

            </section>

            {/* Purchase & Redemption */}
            <section className="grid md:grid-cols-2 gap-6 mt-7">

              {/* Purchase */}
              <div
                id="purchase"
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center">
                    ₹
                  </div>

                  <div>

                    <h3 className="font-bold">
                      Record Purchase
                    </h3>

                    <p className="text-xs text-slate-400">
                      Add points automatically
                    </p>

                  </div>

                </div>

                <input
                  type="number"
                  placeholder="Purchase amount ₹"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="w-full mt-5 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 outline-none focus:border-amber-500"
                />

                <button
                  onClick={addPurchase}
                  className="w-full mt-3 bg-green-500 text-slate-950 font-semibold py-3.5 rounded-xl hover:bg-green-400"
                >
                  Add Purchase
                </button>

              </div>

              {/* Redemption */}
              <div
                id="redeem"
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center">
                    🎁
                  </div>

                  <div>

                    <h3 className="font-bold">
                      Redeem Reward
                    </h3>

                    <p className="text-xs text-slate-400">
                      Use available points
                    </p>

                  </div>

                </div>

                <select
                  value={rewardCost}
                  onChange={(e) => {
                    const value = Number(e.target.value)

                    setRewardCost(value)

                    if (value === 300) {
                      setRewardName("Free Coffee")
                    } else if (value === 500) {
                      setRewardName("Sandwich")
                    } else if (value === 700) {
                      setRewardName("Dessert")
                    } else {
                      setRewardName("Meal")
                    }
                  }}
                  className="w-full mt-5 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 outline-none"
                >
                  <option value="300">
                    Free Coffee — 300 points
                  </option>

                  <option value="500">
                    Sandwich — 500 points
                  </option>

                  <option value="700">
                    Dessert — 700 points
                  </option>

                  <option value="1000">
                    Meal — 1,000 points
                  </option>

                </select>

                <button
                  onClick={redeemReward}
                  className="w-full mt-3 bg-purple-500 text-white font-semibold py-3.5 rounded-xl hover:bg-purple-400"
                >
                  Redeem Reward
                </button>

              </div>

            </section>

            {/* Transactions */}
            <section
              id="transactions"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-7"
            >

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="text-lg font-bold">
                    Recent Transactions
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Latest member activity
                  </p>

                </div>

                <button className="text-amber-400 text-sm font-semibold">
                  View All →
                </button>

              </div>

              <div className="overflow-x-auto mt-6">

                <table className="w-full text-sm">

                  <thead>

                    <tr className="border-b border-slate-800 text-slate-500">

                      <th className="text-left py-3">
                        TYPE
                      </th>

                      <th className="text-left py-3">
                        DESCRIPTION
                      </th>

                      <th className="text-left py-3">
                        POINTS
                      </th>

                      <th className="text-left py-3">
                        BALANCE
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {transactions.map((transaction, index) => (

                      <tr
                        key={index}
                        className="border-b border-slate-800 last:border-0"
                      >

                        <td className="py-4">

                          <span
                            className={
                              transaction.type === "Purchase"
                                ? "text-green-400"
                                : "text-purple-400"
                            }
                          >
                            {transaction.type}
                          </span>

                        </td>

                        <td className="text-slate-300">
                          {transaction.description}
                        </td>

                        <td
                          className={
                            transaction.points > 0
                              ? "text-green-400 font-semibold"
                              : "text-red-400 font-semibold"
                          }
                        >
                          {transaction.points > 0 ? "+" : ""}
                          {transaction.points}
                        </td>

                        <td className="font-semibold">
                          {transaction.balance.toLocaleString()}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  )
}

export default App