import React, { Component } from "react";
import PropTypes from "prop-types";
import Icon from "react-svg-icons";
import { Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import BookmarkStore from "../../stores/BookmarkStore";
import BookmarkActions from "../../actions/BookmarkActions";
import { showToastError, showToastSuccess } from "../../utils/showToast";
import { renderLog } from "../../utils/logging";
import VoterActions from "../../actions/VoterActions";
import VoterConstants from "../../constants/VoterConstants";
import VoterStore from "../../stores/VoterStore";


export default class BookmarkToggle extends Component {
  static propTypes = {
    we_vote_id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  };

  constructor (props) {
    super(props);
    this.state = {
      componentDidMountFinished: false,
      showBookmarkToggleHelpModal: false,
    };
  }

  componentDidMount () {
    this.token = BookmarkStore.addListener(this._onChange.bind(this));
    this._onChange();
    this.setState({
      componentDidMountFinished: true,
    });

    this._onVoterStoreChange();
    this.voterStoreListener = VoterStore.addListener(this._onVoterStoreChange.bind(this));
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if componentWillReceiveProps didn't see any changes
    if (this.state.componentDidMountFinished === false) {
      // console.log("shouldComponentUpdate: componentDidMountFinished === false");
      return true;
    }
    if (this.state.isBookmarked !== nextState.isBookmarked) {
      // console.log("shouldComponentUpdate: this.state.isBookmarked", this.state.isBookmarked, ", nextState.isBookmarked", nextState.isBookmarked);
      return true;
    }
    if (this.state.showBookmarkToggleHelpModal !== nextState.showBookmarkToggleHelpModal) {
      // console.log("shouldComponentUpdate: this.state.showBookmarkToggleHelpModal", this.state.showBookmarkToggleHelpModal, ", nextState.showBookmarkToggleHelpModal", nextState.showBookmarkToggleHelpModal);
      return true;
    }
    return false;
  }

  componentWillUnmount () {
    this.token.remove();
    this.voterStoreListener.remove();
  }

  _onChange () {
    this.setState({ isBookmarked: BookmarkStore.get(this.props.we_vote_id) || false});
    // console.log(this.state);
  }

  _onVoterStoreChange () {
    this.setState({ voter: VoterStore.getVoter() });
  }

  BookmarkClick () {
    if (this.state.isBookmarked) {
      BookmarkActions.voterBookmarkOffSave(this.props.we_vote_id, this.props.type);
      showToastError("Bookmark removed!");
    } else {
      let bookmark_action_modal_has_been_shown = VoterStore.getInterfaceFlagState(VoterConstants.BOOKMARK_ACTION_MODAL_SHOWN);

      BookmarkActions.voterBookmarkOnSave(this.props.we_vote_id, this.props.type);

      if (!bookmark_action_modal_has_been_shown) {
        this.toggleBookmarkToggleHelpModal();
        VoterActions.voterUpdateInterfaceStatusFlags(VoterConstants.BOOKMARK_ACTION_MODAL_SHOWN);
      } else {
        showToastSuccess("Bookmark saved!");
      }
    }
  }

  BookmarkKeyDown (e) {
    let enterAndSpaceKeyCodes = [13, 32];
    if (enterAndSpaceKeyCodes.includes(e.keyCode)) {
      this.BookmarkClick().bind(this);
    }
  }

  toggleBookmarkToggleHelpModal () {
    this.setState({
      showBookmarkToggleHelpModal: !this.state.showBookmarkToggleHelpModal,
    });
  }

  render () {
    // console.log("BookmarkToggle render");
    renderLog(__filename);
    if (this.state.isBookmarked === undefined){
      return <span className="bookmark-action" />;
    }

    // This modal is shown when the user bookmarks a ballot item for the first time.
    const BookmarkToggleHelpModal = <Modal show={this.state.showBookmarkToggleHelpModal} onHide={()=>{this.toggleBookmarkToggleHelpModal();}}>
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="text-center">Bookmark</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className="card">
          <div className="text-center">
            You have just bookmarked this ballot item.<br />
            <br />
            Find 'Your Bookmarked Items' by clicking the profile photo or icon in the upper right corner of the top navigation.<br />
            <br />
          </div>
        </section>
      </Modal.Body>
    </Modal>;
    const bookmarkPopoverText = "Bookmark for later";
    const bookmarkToolTip = <Tooltip id="bookmarkTooltip">{ bookmarkPopoverText }</Tooltip>;
    return <div className="d-print-none">
        <span tabIndex="0"
              className="bookmark-action"
              onClick={this.BookmarkClick.bind(this)}
              onKeyDown={this.BookmarkKeyDown.bind(this)}
              title="Bookmark for later">
              {this.state.isBookmarked ?
                <Icon alt="Is Bookmarked" name="bookmark-icon" width={24} height={24} fill="#999" stroke="none" color="#999" /> :
                <OverlayTrigger placement="top" overlay={bookmarkToolTip}>
                  <Icon alt="Bookmark for later" name="bookmark-icon" width={24} height={24} fill="none" stroke="#ccc" strokeWidth={2} color="#ccc" />
                </OverlayTrigger>
              }
            </span>
      { this.state.showBookmarkToggleHelpModal ? BookmarkToggleHelpModal : null }
    </div>;
  }
}
