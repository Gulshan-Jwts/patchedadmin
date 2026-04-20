# First prompt:

My user Model
```javascript
// my user model
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  receivingPhone: String,
  payingPhone: String,
  referrer: { type: String, default: null },
  wallet: { type: Number, default: 0 },
  plan: {
    active: { type: Number, default: 1 },
    pending: { type: Number, default: 0 },
  },
  today: {
    date: Date,
    quota: Number,
  },
  withdraw: { amount: { type: Number, default: 0 }, source: String },
  pendingWithdraw: Number,
  earned: Number,
  limit: { type: Number, default: 490 },
  history: [
    {
      source: String,
      isPending: { type: Boolean, default: true },
      description: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  messages: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);

```

My Current Payment Model
```javascript
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    to: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

```

My Current pay route
```javascript
router.post("/user/pay", authMiddleware, async (req, res) => {
  await connectMongo();
  const { productIds } = await req.json();

  if (!Array.isArray(productIds) || productIds.length === 0) {
    res.json({ success: false, message: "productIds array required" });
    return;
  }
  const users = await User.find({
    _id: { $in: productIds },
  });
  res.json({ message: "Successfully Updated", success: true });
});
```

```html
<body>

    <nav class="admin-navbar">
         <div class="nav-left">
            <span class="material-symbols-rounded nav-logo-icon">dashboard</span>
            <span class="nav-title">CarriagePatch Admin</span>
        </div>
        <div class="nav-right">
            <a href="/home" class="btn-back">
                <span class="material-symbols-rounded" style="font-size: 20px;">arrow_back</span>
                Dashboard
            </a>
        </div>
    </nav>

    <main class="dashboard-main">
        <div class="stat-card" style="border-bottom: 3px solid #ea4335;">
            <div class="stat-label">
                To Pay Requests
            </div>
            <div class="stat-val">
                <%= usersToPay.length %>
            </div>
            <div class="stat-subtext">
                Total: ₹<span id="total-amt"></span>
            </div>
        </div>

        <button class="submit-btn">
            Submit
            <span class="material-symbols-rounded">done</span>
        </button>

        <div class="data-panel">
            <div class="table-head">
                <span>Account</span>
                <span>Amount</span>
                <span>Type</span>
                <span>Date</span>
                <span>Action</span>
            </div>

            <script>
                console.log(usersToPay)
                const usersData = [{
                    name: "Prince Kewat",
                    amount: "1,500",
                    type: "Withdrawal",
                    date: "Apr 11, 2026",
                    email: "prince.dev@gmail.com",
                    phone: "+91 98765-43210",
                    plan: "₹299 Pro"
                },
                    {
                        name: "Aman Singh",
                        amount: "50",
                        type: "Refer Bonus",
                        date: "Apr 10, 2026",
                        email: "aman.s@yahoo.com",
                        phone: "+91 88776-65544",
                        plan: "Free Tier"
                    },
                    {
                        name: "Rahul Varma",
                        amount: "50",
                        type: "Refer Bonus",
                        date: "Apr 08, 2026",
                        email: "rahul.v@gmail.com",
                        phone: "+91 99887-76655",
                        plan: "₹199 Basic"
                    },
                    {
                        name: "Amit Brar",
                        amount: "50",
                        type: "Refer Bonus",
                        date: "Apr 06, 2026",
                        email: "amit.brar@gmail.com",
                        phone: "+91 91223-34455",
                        plan: "Not Active"
                    }];

                document.write(usersData.map(u => `
                    <div class="table-row">
                    <div class="user-cell">
                    <div class="u-avatar">${u.name.charAt(0)}${u.name.split(' ')[1].charAt(0)}</div>
                    <div style="font-weight: 600;">${u.name}</div>

                    <div class="popover-details">
                    <div class="pop-row"><span class="pop-label">User Name</span><span class="pop-val">${u.name}</span></div>
                    <div class="pop-row"><span class="pop-label">Gmail</span><span class="pop-val">${u.email}</span></div>
                    <div class="pop-row"><span class="pop-label">Mobile No.</span><span class="pop-val">${u.phone}</span></div>
                    <div class="pop-row"><span class="pop-label">Requested On</span><span class="pop-val">₹${u.amount} (${u.type})</span></div>
                    <div class="pop-row"><span class="pop-label">Current Plan</span><span class="pop-val">${u.plan}</span></div>
                    <div class="pop-row"><span class="pop-label">Joined On</span><span class="pop-val">Feb 12, 2026</span></div>
                    </div>
                    </div>

                    <div style="font-weight: 700;">₹${u.amount}</div>

                    <div>
                    <span class="badge ${u.type === 'Withdrawal' ? 'badge-withdraw': 'badge-refer'}">${u.type}</span>
                    </div>

                    <div style="color: var(--text-sub); font-size: 0.85rem;">${u.date}</div>

                    <div>
                    <button class="btn-done" onclick="this.classList.toggle('completed')">
                    <span class="material-symbols-rounded tick-icon">check_circle</span>
                    Done
                    </button>
                    </div>
                    </div>
                    `).join(''));
            </script>
        </div>
    </main>

</body>
```

## Task Write a code for api that:
- updates user.withdraw.amount to 0
- if user.withdraw.source = "refer" then add it to the history else not
- and user.withdraw.source = ""
- add a message that "amount is credited"
- and marks the payment in Payment model

## Task Update the code of topay.html in ejs format to :
- Show the stats and users nicely
- Finally hit a fetch req to "/user/pay" that updates users

# Second prompt:

My current Revenue model
```javascript
const mongoose = require("mongoose");

const RevenueSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    from: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Revenue || mongoose.model("Revenue", RevenueSchema);
```

Confirm plan activation Html UI:
```html
<body>

    <nav class="admin-navbar">
        <div class="nav-left">
            <span class="material-symbols-rounded nav-logo-icon">dashboard</span>
            <span class="nav-title">CarriagePatch Admin</span>
        </div>
        <div class="nav-right">
            <a href="home.html" class="btn-back">
                <span class="material-symbols-rounded" style="font-size: 20px;">arrow_back</span>
                Dashboard
            </a>
        </div>
    </nav>

    <main class="dashboard-main">
        <div class="stat-card" style="border-bottom: 3px solid #ea4335;">
            <div class="stat-label">
                To Activate Requests
            </div>
            <div class="stat-val">
                4 users
            </div>
        </div>
        
        <button class="submit-btn">
            Submit
            <span class="material-symbols-rounded">done</span>
        </button>


        <div class="data-panel">
            <div class="table-head">
                <span>User</span>
                <span>Paid Amount</span>
                <span>Payment Date</span>
                <span>Action</span>
            </div>

            <script>
                const users = [{
                    name: "Rahul Sharma",
                    paid: "299",
                    date: "Apr 12, 2026",
                    email: "rahul.sh@gmail.com",
                    phone: "+91 98123-45678",
                    joined: "Feb 10, 2026"
                },
                    {
                        name: "Sneha Kapoor",
                        paid: "199",
                        date: "Apr 11, 2026",
                        email: "sneha.k@outlook.com",
                        phone: "+91 88223-34455",
                        joined: "Mar 02, 2026"
                    },
                    {
                        name: "Vikas Singh",
                        paid: "299",
                        date: "Apr 11, 2026",
                        email: "vikas.dev@gmail.com",
                        phone: "+91 77665-54433",
                        joined: "Jan 15, 2026"
                    },
                    {
                        name: "Anjali Verma",
                        paid: "199",
                        date: "Apr 10, 2026",
                        email: "anjali.v@yahoo.com",
                        phone: "+91 99880-11223",
                        joined: "Mar 20, 2026"
                    }];

                document.write(users.map(u => `
                    <div class="table-row">
                    <div class="user-cell">
                    <div class="u-avatar">${u.name.charAt(0)}${u.name.split(' ')[1].charAt(0)}</div>
                    <div style="font-weight: 600;">${u.name}</div>

                    <div class="popover-details">
                    <div class="pop-row"><span class="pop-label">User Name</span><span class="pop-val">${u.name}</span></div>
                    <div class="pop-row"><span class="pop-label">Gmail</span><span class="pop-val">${u.email}</span></div>
                    <div class="pop-row"><span class="pop-label">Mobile No.</span><span class="pop-val">${u.phone}</span></div>
                    <div class="pop-row"><span class="pop-label">Paid Amount</span><span class="pop-val">₹${u.paid}</span></div>
                    <div class="pop-row"><span class="pop-label">CURRENT PLAN</span><span class="pop-val">Not Active</span></div>
                    <div class="pop-row"><span class="pop-label">Joined On</span><span class="pop-val">${u.joined}</span></div>
                    </div>
                    </div>

                    <div>
                    <span class="mobile-label">Amount Paid</span>
                    <span style="font-weight: 700;">₹${u.paid}</span>
                    </div>

                    <div style="color: var(--text-sub); font-size: 0.85rem;">
                    <span class="mobile-label">Payment Date</span>
                    ${u.date}
                    </div>

                    <div>
                    <button class="btn-done" onclick="this.classList.toggle('completed')">
                    <span class="material-symbols-rounded tick-icon">check_circle</span>
                    Done
                    </button>
                    </div>
                    </div>
                    `).join(''));
            </script>
        </div>
    </main>

</body>
```

## Task is to:
- Create a route to render this at giving it all the users that have plan.pending > 0 "toconfirm.ejs"
- Create a post route that takes all the userIds and set their plan.pending to 0, plan.since to date.now and plan.active to plan.pending
- if there is any referer in user then add 50 ruppes to the referer's history with source: refer and isPending true
- Add it to the revnue