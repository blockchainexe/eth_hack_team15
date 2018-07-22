import lkTestHelpers from 'lk-test-helpers/src/main.js'
const {
  increaseTime,
  expectRevert
} = lkTestHelpers(web3)
var EducationPass = artifacts.require("EducationPass.sol");

const callback = (e, r) => new Promise((resolve, reject) => (e ? reject(e) : resolve(r)))

contract('EducationPass', function(accounts) {
  it("should assert true", async () => {
    const educationPass = await EducationPass.new()
    assert.isOk(educationPass)
  })

  describe('mint', () => {
    it('success', async () => {
      const educationPass = await EducationPass.new()
      const beforeBalance = await educationPass.balanceOf(accounts[0])
      assert.equal(0, beforeBalance)

      await educationPass.mint(accounts[0], 12345)
      const afterBalance = await educationPass.balanceOf(accounts[0])
      assert.equal(1, afterBalance)
    })
    it('failed, deplication id.', async () => {
      const educationPass = await EducationPass.new()
      const beforeBalance = await educationPass.balanceOf(accounts[0])
      assert.equal(0, beforeBalance)

      await educationPass.mint(accounts[0], 12345)
      await expectRevert(educationPass.mint(accounts[1], 12345))
    })
    it('failed, deplication owner.', async () => {
      const educationPass = await EducationPass.new()
      const beforeBalance = await educationPass.balanceOf(accounts[0])
      assert.equal(0, beforeBalance)

      await educationPass.mint(accounts[0], 12345)
      await expectRevert(educationPass.mint(accounts[0], 123456))
    })
  })

  describe('exits', () => {
    it('success', async () => {
      const educationPass = await EducationPass.new()
      await educationPass.mint(accounts[0], 12345)
      const exists = await educationPass.exists(12345)
      assert.isTrue(exists)
    })
    it('no mint', async () => {
      const educationPass = await EducationPass.new()
      const exists = await educationPass.exists(12345)
      assert.isFalse(exists)
    })
    it('expired', async () => {
      const educationPass = await EducationPass.new()
      await educationPass.mint(accounts[0], 12345)
      const exists = await educationPass.exists(12345)
      assert.isTrue(exists)

      await increaseTime((1 * 365 * 24 * 60 * 60) + 2000)
      const expiredExists = await educationPass.exists(12345)
      assert.isFalse(expiredExists)
    })
  })

  describe('exnted limit', () => {
    it('success', async () => {
      const educationPass = await EducationPass.new()
      await educationPass.mint(accounts[0], 12345)
      const exists = await educationPass.exists(12345)
      await increaseTime((1 * 365 * 24 * 60 * 60) + 2000)
      const expiredExists = await educationPass.exists(12345)
      assert.isFalse(expiredExists)

      await educationPass.mint(accounts[0], 12345)
      const extended = await educationPass.exists(12345)
      assert.isTrue(extended)
    })
    it('fail other id', async () => {
      const educationPass = await EducationPass.new()
      await educationPass.mint(accounts[0], 12345)
      const exists = await educationPass.exists(12345)
      await increaseTime((1 * 365 * 24 * 60 * 60) + 2000)
      const expiredExists = await educationPass.exists(12345)
      assert.isFalse(expiredExists)

      await expectRevert(educationPass.mint(accounts[0], 123456))
    })
    it('fail other owner', async () => {
      const educationPass = await EducationPass.new()
      await educationPass.mint(accounts[0], 12345)
      const exists = await educationPass.exists(12345)
      await increaseTime((1 * 365 * 24 * 60 * 60) + 2000)
      const expiredExists = await educationPass.exists(12345)
      assert.isFalse(expiredExists)

      await expectRevert(educationPass.mint(accounts[1], 12345))
    })
    it('happend event', async () => {
      const educationPass = await EducationPass.new()
      const filter = await educationPass.Extended({}, { fromBlock: 0, toBlock: 'latest' }, callback)
      await educationPass.mint(accounts[0], 12345)
      const exists = await educationPass.exists(12345)
      await increaseTime((1 * 365 * 24 * 60 * 60) + 2000)
      const expiredExists = await educationPass.exists(12345)
      assert.isFalse(expiredExists)

      await educationPass.mint(accounts[0], 12345)
      const events = filter.get()

      assert.equal(1, events.length)
      assert.equal(accounts[0], events[0].args.student)
      assert.equal(12345, events[0].args.tokenId)
    })
  })
});
