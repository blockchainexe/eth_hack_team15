# Meetup Gakusei-NFT verifier

```
# sequence
- student: put email to form
- system: send QR to email
- student: scan QR
- student: accept verification
- system: got hit /verify action
- system: get NMID->ProxyContract_ADDR->NFT_ADDR
- system: get NFT.isStudent state
- system: generate onetime coupon by "bytes6(sha3(MNID + EventID))" 
- system: OAuth to EventBrite
- system: Save coupon to EventBrite
- user: get coupon
```