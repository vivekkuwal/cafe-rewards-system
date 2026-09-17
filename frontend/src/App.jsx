import { useState } from "react"

const BACKEND_URL =
  "https://super-duper-waddle-4jqwr4w7qjjjc7rw7-5000.app.github.dev"

function App() {
  const [phone, setPhone] = useState("")
  const [member, setMember] = useState(null)
  const [message, setMessage] = useState("")
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [rewardName, setRewardName] = useState("Free Coffee")
  const [rewardCost, setRewardCost] = useState(300)
  const [transactions, setTransactions] = useState([])

  // =========================
  // SEARCH MEMBER
  // =========================
  const searchMember = async () => {
    if (!phone.trim()) {
      setMessage("Please enter a phone number")
      return
    }

    try {
      setMessage("Searching member...")

      const url =
        BACKEND_URL +
        "/api/members/search?phone=" +
        encodeURIComponent(phone.trim())

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        setMember(null)
        setMessage(data.message || "Member not found")
        return
      }

      setMember(data)
      setTransactions([])
      setMessage("Member found successfully")
    } catch (error) {
      console.error("Search error:", error)
      setMessage("Unable to connect to backend")
    }
  }

  // =========================
  // ADD PURCHASE
  // =========================
  const addPurchase = async () => {
    if (!member) {
      setMessage("Please search for a member first")
      return
    }

    const amount = Number(purchaseAmount)

    if (!amount || amount <= 0) {
      setMessage("Please enter a valid purchase amount")
      return
    }

    try {
      setMessage("Processing purchase...")

      const response = await fetch(
        BACKEND_URL + "/api/purchases",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberId: member.id,
            amount: amount,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || "Purchase failed")
        return
      }

      const purchase = data.purchase

      setMember((oldMember) => ({
        ...oldMember,
        points: purchase.balanceAfter,
      }))

      setTransactions((oldTransactions) => [
        {
          type: "Purchase",
          description: "₹" + purchase.amount + " purchase",
          points: purchase.pointsEarned,
          balance: purchase.balanceAfter,
        },
        ...oldTransactions,
      ])

      setPurchaseAmount("")

      setMessage(
        "Purchase successful! +" +
          purchase.pointsEarned +
          " points"
      )
    } catch (error) {
      console.error("Purchase error:", error)
      setMessage("Unable to connect to backend")
    }
  }

  // =========================
  // REDEEM REWARD
  // =========================
  const redeemReward = async () => {
    if (!member) {
      setMessage("Please search for a member first")
      return
    }

    if (member.points < rewardCost) {
      setMessage("Insufficient points")
      return
    }

    try {
      setMessage("Processing redemption...")

      const response = await fetch(
        BACKEND_URL + "/api/redemptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberId: member.id,
            rewardName: rewardName,
            pointsCost: rewardCost,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || "Redemption failed")
        return
      }

      const redemption = data.redemption

      setMember((oldMember) => ({
        ...oldMember,
        points: redemption.balanceAfter,
      }))

      setTransactions((oldTransactions) => [
        {
          type: "Redemption",
          description: redemption.rewardName,
          points: -redemption.pointsCost,
          balance: redemption.balanceAfter,
        },
        ...oldTransactions,
      ])

      setMessage(
        "Reward redeemed successfully! -" +
          redemption.pointsCost +
          " points"
      )
    } catch (error) {
      console.error("Redemption error:", error)
      setMessage("Unable to connect to backend")
    }
  }

  // =========================
  // CHANGE REWARD
  // =========================
  const changeReward = (event) => {
    const selectedReward = event.target.value

    setRewardName(selectedReward)

    if (selectedReward === "Free Coffee") {
      setRewardCost(300)
    } else if (selectedReward === "Sandwich") {
      setRewardCost(500)
    } else if (selectedReward === "Dessert") {
      setRewardCost(700)
    } else if (selectedReward === "Meal") {
      setRewardCost(1000)
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= SIDEBAR ================= */}

      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-900 p-6 md:block">

        <div>
          <h1 className="text-2xl font-bold text-amber-400">
            ☕ BrewRewards
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Café Loyalty System
          </p>
        </div>

        <nav className="mt-10 space-y-2">

          <div className="rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950">
            Dashboard
          </div>

          <div className="rounded-lg px-4 py-3 text-slate-400">
            Members
          </div>

          <div className="rounded-lg px-4 py-3 text-slate-400">
            Rewards
          </div>

          <div className="rounded-lg px-4 py-3 text-slate-400">
            Transactions
          </div>

        </nav>

        {/* Backend Status */}

        <div className="absolute bottom-6 left-6 right-6 rounded-lg bg-slate-800 p-4">

          <p className="text-xs text-slate-500">
            Backend Status
          </p>

          <div className="mt-2 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>

            <span className="text-sm text-emerald-400">
              API Connected
            </span>

          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="min-h-screen md:ml-64">

        {/* HEADER */}

        <header className="border-b border-slate-800 bg-slate-950 px-6 py-6 md:px-10">

          <p className="text-sm font-semibold tracking-wide text-amber-400">
            STAFF DASHBOARD
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            Rewards Management
          </h2>

          <p className="mt-1 text-slate-400">
            Manage members, purchases and reward redemptions.
          </p>

        </header>

        <div className="p-6 md:p-10">

          {/* ================= MEMBER SEARCH ================= */}

          <section className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 shadow-lg">

            <p className="text-sm font-semibold text-slate-900">
              MEMBER LOOKUP
            </p>

            <h3 className="mt-1 text-2xl font-bold text-slate-950">
              Find a Member
            </h3>

            <p className="mt-1 text-sm text-slate-800">
              Search using the member's registered phone number.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">

              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    searchMember()
                  }
                }}
                placeholder="9876543210"
                className="flex-1 rounded-lg bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                onClick={searchMember}
                className="rounded-lg bg-slate-950 px-7 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Search Member
              </button>

            </div>

            {message && (
              <div className="mt-4 rounded-lg bg-white/70 px-4 py-3 text-sm font-semibold text-slate-900">
                {message}
              </div>
            )}

          </section>

          {/* ================= STATS ================= */}

          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* MEMBER */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Member
              </p>

              <h3 className="mt-2 text-xl font-bold">
                {member ? member.name : "—"}
              </h3>

              {member && (
                <p className="mt-2 text-sm text-slate-500">
                  {member.phone}
                </p>
              )}

            </div>

            {/* TIER */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Current Tier
              </p>

              <h3 className="mt-2 text-xl font-bold text-amber-400">
                {member ? member.tier : "—"}
              </h3>

              {member && (
                <p className="mt-2 text-sm text-slate-500">
                  {member.multiplier}x points multiplier
                </p>
              )}

            </div>

            {/* POINTS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Points Balance
              </p>

              <h3 className="mt-2 text-2xl font-bold text-emerald-400">
                {member ? member.points : "—"}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Available reward points
              </p>

            </div>

          </section>

          {/* ================= MEMBER ACTIONS ================= */}

          {member && (
            <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* PURCHASE */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-emerald-400">
                      EARN POINTS
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      Record Purchase
                    </h3>
                  </div>

                  <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                    Purchase
                  </div>

                </div>

                <p className="mt-3 text-sm text-slate-400">
                  ₹10 = 1 base point × {member.multiplier}x multiplier
                </p>

                <input
                  type="number"
                  min="1"
                  value={purchaseAmount}
                  onChange={(event) =>
                    setPurchaseAmount(event.target.value)
                  }
                  placeholder="Enter purchase amount"
                  className="mt-5 w-full rounded-lg bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  onClick={addPurchase}
                  className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Add Purchase
                </button>

              </div>

              {/* REDEMPTION */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-amber-400">
                      USE POINTS
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      Redeem Reward
                    </h3>
                  </div>

                  <div className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                    Reward
                  </div>

                </div>

                <p className="mt-3 text-sm text-slate-400">
                  Available points:{" "}
                  <span className="font-semibold text-white">
                    {member.points}
                  </span>
                </p>

                <select
                  value={rewardName}
                  onChange={changeReward}
                  className="mt-5 w-full rounded-lg bg-slate-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-amber-500"
                >

                  <option value="Free Coffee">
                    Free Coffee — 300 points
                  </option>

                  <option value="Sandwich">
                    Sandwich — 500 points
                  </option>

                  <option value="Dessert">
                    Dessert — 700 points
                  </option>

                  <option value="Meal">
                    Meal — 1000 points
                  </option>

                </select>

                <button
                  onClick={redeemReward}
                  disabled={member.points < rewardCost}
                  className="mt-4 w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Redeem {rewardName}
                </button>

                {member.points < rewardCost && (
                  <p className="mt-3 text-sm text-red-400">
                    Not enough points for this reward.
                  </p>
                )}

              </div>

            </section>
          )}

          {/* ================= TRANSACTIONS ================= */}

          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  ACTIVITY
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Recent Transactions
                </h3>

              </div>

              <div className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-400">
                {transactions.length} transactions
              </div>

            </div>

            {transactions.length === 0 ? (

              <div className="mt-6 rounded-lg border border-dashed border-slate-700 p-8 text-center">

                <div className="text-3xl">
                  ☕
                </div>

                <p className="mt-3 text-slate-500">
                  No transactions yet.
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Purchases and redemptions will appear here.
                </p>

              </div>

            ) : (

              <div className="mt-6 overflow-x-auto">

                <table className="w-full text-left">

                  <thead>

                    <tr className="border-b border-slate-800 text-sm text-slate-500">

                      <th className="px-4 py-3">
                        Type
                      </th>

                      <th className="px-4 py-3">
                        Description
                      </th>

                      <th className="px-4 py-3">
                        Points
                      </th>

                      <th className="px-4 py-3">
                        Balance
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {transactions.map((transaction, index) => (

                      <tr
                        key={index}
                        className="border-b border-slate-800 last:border-0"
                      >

                        <td className="px-4 py-4">

                          <span
                            className={
                              transaction.type === "Purchase"
                                ? "rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400"
                                : "rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-400"
                            }
                          >
                            {transaction.type}
                          </span>

                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {transaction.description}
                        </td>

                        <td
                          className={
                            transaction.points >= 0
                              ? "px-4 py-4 font-semibold text-emerald-400"
                              : "px-4 py-4 font-semibold text-red-400"
                          }
                        >
                          {transaction.points > 0 ? "+" : ""}
                          {transaction.points}
                        </td>

                        <td className="px-4 py-4 font-semibold">
                          {transaction.balance}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </section>

          {/* ================= REWARDS INFO ================= */}

          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div>
              <p className="text-sm text-slate-500">
                AVAILABLE REWARDS
              </p>

              <h3 className="mt-1 text-xl font-bold">
                Café Rewards
              </h3>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="text-2xl">
                  ☕
                </div>

                <h4 className="mt-3 font-semibold">
                  Free Coffee
                </h4>

                <p className="mt-1 text-sm text-amber-400">
                  300 points
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="text-2xl">
                  🥪
                </div>

                <h4 className="mt-3 font-semibold">
                  Sandwich
                </h4>

                <p className="mt-1 text-sm text-amber-400">
                  500 points
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="text-2xl">
                  🍰
                </div>

                <h4 className="mt-3 font-semibold">
                  Dessert
                </h4>

                <p className="mt-1 text-sm text-amber-400">
                  700 points
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="text-2xl">
                  🍽️
                </div>

                <h4 className="mt-3 font-semibold">
                  Meal
                </h4>

                <p className="mt-1 text-sm text-amber-400">
                  1000 points
                </p>

              </div>

            </div>

          </section>

          {/* ================= FOOTER ================= */}

          <footer className="mt-10 border-t border-slate-800 py-6 text-center text-sm text-slate-600">
            BrewRewards Café Loyalty Management System
          </footer>

        </div>

      </main>

    </div>
  )
}

export default App