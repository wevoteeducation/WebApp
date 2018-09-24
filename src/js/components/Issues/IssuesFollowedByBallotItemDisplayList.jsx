import React, { Component } from "react";
import PropTypes from "prop-types";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { findDOMNode } from "react-dom";
import $ from "jquery";
import { isCordova } from "../../utils/cordovaUtils";
import VoterGuideStore from "../../stores/VoterGuideStore";
import IssuesDisplayListWithOrganizationPopovers from "../Issues/IssuesDisplayListWithOrganizationPopovers";
import IssueStore from "../../stores/IssueStore";
import { renderLog } from "../../utils/logging";

// Show a voter a horizontal list of all of the issues they are following that relate to this ballot item,
//  with a dropdown under each one that has all of the organizations they can follow underneath.
export default class IssuesFollowedByBallotItemDisplayList extends Component {
  static propTypes = {
    ballot_item_display_name: PropTypes.string,
    ballotItemWeVoteId: PropTypes.string.isRequired,
    currentBallotIdInUrl: PropTypes.string,
    overlayTriggerOnClickOnly: PropTypes.bool,
    popoverBottom: PropTypes.bool,
    urlWithoutHash: PropTypes.string,
    we_vote_id: PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {
      transitioning: false,
      showModal: false,
      can_scroll_desktop: false,
      can_scroll_mobile: false,
      can_scroll_left_desktop: false,
      can_scroll_left_mobile: false,
      can_scroll_right_desktop: true,
      can_scroll_right_mobile: true,
      issues_under_this_ballot_item: [],
      issues_under_this_ballot_item_voter_is_following: [],
      issues_under_this_ballot_item_voter_not_following: [],
      issues_voter_is_following: [],
      maximum_organization_display: 4,
    };
    this.closeIssuesLabelPopover = this.closeIssuesLabelPopover.bind(this);
  }

  componentDidMount () {
    this.issueStoreListener = IssueStore.addListener(this.onIssueStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.onVoterGuideStoreChange();
    this.setScrollState();
    this.setState({
      ballotItemWeVoteId: this.props.ballotItemWeVoteId,
      ballot_item_display_name: this.props.ballot_item_display_name ? this.props.ballot_item_display_name : "this candidate",
      issues_under_this_ballot_item: IssueStore.getIssuesUnderThisBallotItem(this.props.ballotItemWeVoteId),
      issues_under_this_ballot_item_voter_is_following: IssueStore.getIssuesUnderThisBallotItemVoterIsFollowing(this.props.ballotItemWeVoteId),
      issues_under_this_ballot_item_voter_not_following: IssueStore.getIssuesUnderThisBallotItemVoterNotFollowing(this.props.ballotItemWeVoteId),
      issues_voter_is_following: IssueStore.getIssuesVoterIsFollowing(),
    });
  }

  componentWillReceiveProps (nextProps) {
    this.setScrollState();
    this.setState({
      ballotItemWeVoteId: nextProps.ballotItemWeVoteId,
      ballot_item_display_name: nextProps.ballot_item_display_name ? nextProps.ballot_item_display_name : "this candidate",
      issues_under_this_ballot_item: IssueStore.getIssuesUnderThisBallotItem(nextProps.ballotItemWeVoteId),
      issues_under_this_ballot_item_voter_is_following: IssueStore.getIssuesUnderThisBallotItemVoterIsFollowing(nextProps.ballotItemWeVoteId),
      issues_under_this_ballot_item_voter_not_following: IssueStore.getIssuesUnderThisBallotItemVoterNotFollowing(nextProps.ballotItemWeVoteId),
      issues_voter_is_following: IssueStore.getIssuesVoterIsFollowing(),
    });
  }

  componentWillUnmount () {
    this.issueStoreListener.remove();
    this.voterGuideStoreListener.remove();
  }

  closeIssuesLabelPopover () {
    document.body.click();
  }

  onIssueStoreChange () {
    this.setScrollState();
    this.setState({
      issues_under_this_ballot_item: IssueStore.getIssuesUnderThisBallotItem(this.state.ballotItemWeVoteId),
      issues_under_this_ballot_item_voter_is_following: IssueStore.getIssuesUnderThisBallotItemVoterIsFollowing(this.state.ballotItemWeVoteId),
      issues_under_this_ballot_item_voter_not_following: IssueStore.getIssuesUnderThisBallotItemVoterNotFollowing(this.state.ballotItemWeVoteId),
      issues_voter_is_following: IssueStore.getIssuesVoterIsFollowing(),
    });
  }

  onVoterGuideStoreChange () {
    // We just want to trigger a re-render
    this.setState({ transitioning: false });

    // console.log("onVoterGuideStoreChange");
  }

  scrollLeft (visibleTag) {
    const element = findDOMNode(this.refs[`${this.props.ballotItemWeVoteId}-issue-list-${visibleTag}`]);
    let position = $(element).scrollLeft();
    let width = Math.round($(element).width());
    $(element).animate({
      scrollLeft: position - width,
    }, 350, () => {
      let newPosition = $(element).scrollLeft();
      if (visibleTag === "desktop") {
        this.setState({
          can_scroll_left_desktop: newPosition > 0,
          can_scroll_right_desktop: true,
        });
      } else {
        this.setState({
          can_scroll_left_mobile: newPosition > 0,
          can_scroll_right_mobile: true,
        });
      }
    });
  }

  scrollRight (visibleTag) {
    const element = findDOMNode(this.refs[`${this.props.ballotItemWeVoteId}-issue-list-${visibleTag}`]);
    let position = $(element).scrollLeft();
    let width = Math.round($(element).width());
    $(element).animate({
      scrollLeft: position + width,
    }, 350, () => {
      let newPosition = $(element).scrollLeft();
      if (visibleTag === "desktop") {
        this.setState({
          can_scroll_left_desktop: newPosition > 0,
          can_scroll_right_desktop: position + width === newPosition,
        });
      } else {
        this.setState({
          can_scroll_left_mobile: newPosition > 0,
          can_scroll_right_mobile: position + width === newPosition,
        });
      }
    });
  }

  setScrollState () {
    const desktopList = findDOMNode(this.refs[`${this.props.ballotItemWeVoteId}-issue-list-desktop`]);
    const mobileList = findDOMNode(this.refs[`${this.props.ballotItemWeVoteId}-issue-list-mobile`]);
    let desktopListVisibleWidth = $(desktopList).width();
    let desktopListWidth = $(desktopList).children().eq(0).children().eq(0).width();
    let mobileListVisibleWidth = $(mobileList).width();
    let mobileListWidth = $(mobileList).children().eq(0).children().eq(0).width();
    this.setState({
      can_scroll_desktop: desktopListVisibleWidth <= desktopListWidth,
      can_scroll_mobile: mobileListVisibleWidth <= mobileListWidth,
    });
  }

  render () {
    renderLog(__filename);
    let issuesUnderThisBallotItemVoterIsFollowingFound = this.state.issues_under_this_ballot_item_voter_is_following && this.state.issues_under_this_ballot_item_voter_is_following.length;
    let issuesUnderThisBallotItemVoterIsNotFollowingFound = this.state.issues_under_this_ballot_item_voter_not_following && this.state.issues_under_this_ballot_item_voter_not_following.length;

    // console.log("this.state.ballotItemWeVoteId: ", this.state.ballotItemWeVoteId);
    // console.log("this.state.issues_under_this_ballot_item: ", this.state.issues_under_this_ballot_item);
    // console.log("this.state.issues_under_this_ballot_item_voter_is_following: ", this.state.issues_under_this_ballot_item_voter_is_following);
    // console.log("this.state.issues_under_this_ballot_item_voter_not_following: ", this.state.issues_under_this_ballot_item_voter_not_following);
    if (!issuesUnderThisBallotItemVoterIsFollowingFound && !issuesUnderThisBallotItemVoterIsNotFollowingFound) {
      return null;
    }

    const issuesLabelPopover =
      <Popover id="positions-popover-trigger-click-root-close"
               title={<span>Issues related to {this.state.ballot_item_display_name}
                  <span className={`fa fa-times pull-right u-cursor--pointer ${isCordova() && "u-mobile-x"} `} aria-hidden="true" /></span>}
               onClick={this.closeIssuesLabelPopover}
               className="card-popover">
        See opinions about {this.state.ballot_item_display_name}, organized by issues you care about.
      </Popover>;

    const issuesLabel =
      <OverlayTrigger trigger="click"
                      rootClose
                      placement={this.props.popoverBottom ? "bottom" : "top"}
                      overlay={issuesLabelPopover}>
        <span className="issues-list-stacked__support-label u-cursor--pointer u-no-break">
          <span>Related<br />Issues</span>
          <span>&nbsp;<i className="fa fa-info-circle fa-md issues-list-stacked__info-icon-for-popover hidden-print" aria-hidden="true" />&nbsp;</span>
        </span>
      </OverlayTrigger>;

    return (
      <div className="issues-list-stacked__support-list u-flex u-justify-between u-items-center">
        {/* Click to scroll left through list Desktop */}
        { this.state.can_scroll_desktop && this.state.can_scroll_left_desktop ?
          <i className="fa fa-2x fa-chevron-left issues-list-stacked__support-list__scroll-icon u-cursor--pointer hidden-xs hidden-print" aria-hidden="true" onClick={this.scrollLeft.bind(this, "desktop")} /> :
          <i className="fa fa-2x fa-chevron-left network-positions-stacked__support-list__scroll-icon--disabled hidden-xs hidden-print" aria-hidden="true" />
        }
        {/* Click to scroll left through list Mobile */}
        { this.state.can_scroll_mobile && this.state.can_scroll_left_mobile ?
          <i className="fa fa-2x fa-chevron-left issues-list-stacked__support-list__scroll-icon u-cursor--pointer visible-xs hidden-print" aria-hidden="true" onClick={this.scrollLeft.bind(this, "mobile")} /> :
          <i className="fa fa-2x fa-chevron-left network-positions-stacked__support-list__scroll-icon--disabled visible-xs hidden-print" aria-hidden="true" />
        }
        <div className="issues-list-stacked__support-list__container-wrap">
          {/* Show a break-down of the current positions in your network */}
          <span ref={`${this.props.ballotItemWeVoteId}-issue-list-desktop`} className="issues-list-stacked__support-list__container u-flex u-justify-between u-items-center u-inset__v--xs hidden-xs">
            <ul className="issues-list-stacked__support-list__items">
              <li className="issues-list-stacked__support-list__item">
                {issuesLabel}

                {/* Issues the voter is already following */}
                <IssuesDisplayListWithOrganizationPopovers ballotItemWeVoteId={this.state.ballotItemWeVoteId}
                                                           currentBallotIdInUrl={this.props.currentBallotIdInUrl}
                                                           issueImageSize={"MEDIUM"}
                                                           issueListToDisplay={this.state.issues_under_this_ballot_item_voter_is_following}
                                                           overlayTriggerOnClickOnly={this.props.overlayTriggerOnClickOnly}
                                                           popoverBottom={this.props.popoverBottom}
                                                           toFollow
                                                           urlWithoutHash={this.props.urlWithoutHash}
                                                           we_vote_id={this.props.we_vote_id} />
                {/* Issues the voter is not following yet */}
                <IssuesDisplayListWithOrganizationPopovers ballotItemWeVoteId={this.state.ballotItemWeVoteId}
                                                           currentBallotIdInUrl={this.props.currentBallotIdInUrl}
                                                           issueImageSize={"MEDIUM"}
                                                           issueListToDisplay={this.state.issues_under_this_ballot_item_voter_not_following}
                                                           overlayTriggerOnClickOnly={this.props.overlayTriggerOnClickOnly}
                                                           popoverBottom={this.props.popoverBottom}
                                                           toFollow
                                                           urlWithoutHash={this.props.urlWithoutHash}
                                                           we_vote_id={this.props.we_vote_id} />
              </li>
            </ul>
          </span>
          <span ref={`${this.props.ballotItemWeVoteId}-issue-list-mobile`} className="issues-list-stacked__support-list__container u-flex u-justify-between u-items-center u-inset__v--xs visible-xs">
            <ul className="issues-list-stacked__support-list__items">
              <li className="issues-list-stacked__support-list__item">
                {issuesLabel}

                {/* Issues the voter is already following */}
                <IssuesDisplayListWithOrganizationPopovers ballotItemWeVoteId={this.state.ballotItemWeVoteId}
                                                           currentBallotIdInUrl={this.props.currentBallotIdInUrl}
                                                           issueImageSize={"MEDIUM"}
                                                           issueListToDisplay={this.state.issues_under_this_ballot_item_voter_is_following}
                                                           overlayTriggerOnClickOnly
                                                           popoverBottom={this.props.popoverBottom}
                                                           toFollow
                                                           urlWithoutHash={this.props.urlWithoutHash}
                                                           we_vote_id={this.props.we_vote_id} />
                {/* Issues the voter is not following yet */}
                <IssuesDisplayListWithOrganizationPopovers ballotItemWeVoteId={this.state.ballotItemWeVoteId}
                                                           currentBallotIdInUrl={this.props.currentBallotIdInUrl}
                                                           issueImageSize={"MEDIUM"}
                                                           issueListToDisplay={this.state.issues_under_this_ballot_item_voter_not_following}
                                                           overlayTriggerOnClickOnly
                                                           popoverBottom={this.props.popoverBottom}
                                                           toFollow
                                                           urlWithoutHash={this.props.urlWithoutHash}
                                                           we_vote_id={this.props.we_vote_id} />
              </li>
            </ul>
          </span>
        </div>
        {/* Click to scroll right through list Desktop */}
        { this.state.can_scroll_desktop && this.state.can_scroll_right_desktop ?
          <i className="fa fa-2x fa-chevron-right issues-list-stacked__support-list__scroll-icon u-cursor--pointer hidden-xs hidden-print" aria-hidden="true" onClick={this.scrollRight.bind(this, "desktop")} /> :
          <i className="fa fa-2x fa-chevron-right network-positions-stacked__support-list__scroll-icon--disabled hidden-xs hidden-print" aria-hidden="true" />
        }
        {/* Click to scroll right through list Mobile */}
        { this.state.can_scroll_mobile && this.state.can_scroll_right_mobile ?
          <i className="fa fa-2x fa-chevron-right issues-list-stacked__support-list__scroll-icon u-cursor--pointer visible-xs hidden-print" aria-hidden="true" onClick={this.scrollRight.bind(this, "mobile")} /> :
          <i className="fa fa-2x fa-chevron-right network-positions-stacked__support-list__scroll-icon--disabled visible-xs hidden-print" aria-hidden="true" />
        }
      </div>
    );
  }
}
