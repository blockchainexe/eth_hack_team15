pragma solidity ^0.4.22;


import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';


contract EducationPass is ERC721Token, Ownable {
  constructor() public ERC721Token("EducationPass", "EPT") {
  }

  function mint(address _to, uint256 _uportId) public onlyOwner {
    require(_to != address(0), "_to is zero.");
    require(!exists(_uportId), "already exist.");
    require(balanceOf(_to) == 0, "already has token.");
    super._mint(_to, _uportId);
  }

  function balanceOf(address _owner) public view returns (uint256 _balance) {
    return super.balanceOf(_owner);
  }

  function exists(uint256 _tokenId) public view returns (bool _exists) {
    return super.exists(_tokenId);
  }
}
