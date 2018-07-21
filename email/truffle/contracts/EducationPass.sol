pragma solidity ^0.4.22;


import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol';


contract EducationPass is ERC721Token, Ownable {
  mapping(uint => uint) public expireDates;
  uint public constant EXPIRE_TERM = 365 days; // 1 years

  constructor() public ERC721Token("EducationPass", "EPT") {
  }

  function mint(address _to, uint256 _uportId) public onlyOwner {
    require(_to != address(0), "_to is zero.");
    if (_exists(_uportId)) {
      require(_expired(_uportId), "the token activate yet.");
      removeTokenFrom(_to, _uportId);
    }
    _mint(_to, _uportId);
    expireDates[_uportId] = now + EXPIRE_TERM;
    require(balanceOf(_to) < 2, "already has other token.");
  }

  /**
   * @dev Returns whether the specified token exists and not expired
   * @param _tokenId uint256 ID of the token to query the existence of
   * @return whether the token exists and not expired
   */
  function exists(uint256 _tokenId) public view returns (bool) {
    return _exists(_tokenId) && !_expired(_tokenId);
  }

  /**
   * @dev Returns whether the specified token expired
   * @param _tokenId uint256 ID of the token to query the existence of
   * @return whether the token exists and not expired
   */
  function _expired(uint256 _tokenId) internal view returns (bool) {
    return now >= expireDates[_tokenId];
  }

  /**
   * @dev Returns whether the specified token exists
   * @param _tokenId uint256 ID of the token to query the existence of
   * @return whether the token exists and not expired
   */
  function _exists(uint256 _tokenId) internal view returns (bool) {
    address owner = tokenOwner[_tokenId];
    return owner != address(0);
  }

}
