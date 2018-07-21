import lkTestHelpers from 'lk-test-helpers/src/main.js'
const {
  advanceBlock,
  advanceToBlock,
  assertJump,
  ether,
  latestTime,
  increaseTime,
  increaseTimeTo,
  EVMThrow,
  expectThrow,
  expectRevert,
  hashMessage,
  timer,
  toPromise,
  transactionMined
} = lkTestHelpers(web3)
var EducationPass = artifacts.require("EducationPass.sol");

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
      await expectRevert(educationPass.mint(accounts[0], 12345))
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
});
