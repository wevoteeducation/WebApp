import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import CandidateStore from "../../stores/CandidateStore";
import FollowToggle from "../Widgets/FollowToggle";
import MeasureStore from "../../stores/MeasureStore";
import OpenExternalWebSite from "../../utils/OpenExternalWebSite";
import OrganizationActions from "../../actions/OrganizationActions";
// import OrganizationStore from "../../stores/OrganizationStore";
import VoterGuideDisplayForList from "./VoterGuideDisplayForList";
import { showToastSuccess } from "../../utils/showToast";
import { stringContains } from "../../utils/textFormat";
import { renderLog } from "../../utils/logging";

export default class GuideList extends Component {

  static propTypes = {
    ballotItemWeVoteId: PropTypes.string,
    organizationsToFollow: PropTypes.array,
    instantRefreshOn: PropTypes.bool,
    hide_stop_following_button: PropTypes.bool,
    hide_ignore_button: PropTypes.bool,
  };

  constructor (props) {
    super(props);
    this.state = {
      organizations_to_follow: [],
      ballot_item_we_vote_id: "",
    };
  }

  componentDidMount () {
    // console.log("GuideList componentDidMount");
    // this.setState({
    //   position_list_from_advisers_followed_by_voter: CandidateStore.getPositionList(this.props.candidate.we_vote_id),
    this.setState({
      organizations_to_follow: this.props.organizationsToFollow,
      ballot_item_we_vote_id: this.props.ballotItemWeVoteId,
    });
  }

  componentWillReceiveProps (nextProps) {
    // console.log("GuideList componentWillReceiveProps");
    //if (nextProps.instantRefreshOn ) {
      // NOTE: This is off because we don't want the organization to disappear from the "More opinions" list when clicked
      this.setState({
        organizations_to_follow: nextProps.organizationsToFollow,
        ballot_item_we_vote_id: nextProps.ballotItemWeVoteId,
      });
    //}
  }

  handleIgnore (id) {
    OrganizationActions.organizationFollowIgnore(id);
    this.setState({ organizations_to_follow: this.state.organizations_to_follow.filter( (org) => { return org.organization_we_vote_id !== id;})});
    showToastSuccess("Added to ignore list.");
  }

  render () {
    renderLog(__filename);
    if (this.state.organizations_to_follow === undefined) {
      // console.log("GuideList this.state.organizations_to_follow === undefined");
      return null;
    }
    // console.log("components/VoterGuide/GuideList render");

    let organization_position_for_this_ballot_item;

    const organization_list = this.state.organizations_to_follow.map( (organization) => {
      if (organization === undefined) {
        // console.log("GuideList org === undefined");
        return null;
      } else {
        // console.log("GuideList organization: ", organization);
        // console.log("GuideList this.state:", this.state);
        organization_position_for_this_ballot_item = {};
        if (!organization.is_support_or_positive_rating && !organization.is_oppose_or_negative_rating && !organization.is_information_only && this.state.ballot_item_we_vote_id && organization.organization_we_vote_id) {
          if (stringContains("cand", this.state.ballot_item_we_vote_id)) {
            organization_position_for_this_ballot_item = CandidateStore.getPositionAboutCandidateFromOrganization(this.state.ballot_item_we_vote_id, organization.organization_we_vote_id);
            // Didn't work
            // organization_position_for_this_ballot_item = OrganizationStore.getOrganizationPositionByWeVoteId(organization.organization_we_vote_id, this.state.ballot_item_we_vote_id);
          } else if (stringContains("meas", this.state.ballot_item_we_vote_id)) {
            organization_position_for_this_ballot_item = MeasureStore.getPositionAboutMeasureFromOrganization(this.state.ballot_item_we_vote_id, organization.organization_we_vote_id);
          }
          // console.log("GuideList organization_position_for_this_ballot_item: ", organization_position_for_this_ballot_item);
        }

        return <VoterGuideDisplayForList key={organization.organization_we_vote_id}
                                         {...organization}
                                         {...organization_position_for_this_ballot_item}>
          <FollowToggle we_vote_id={organization.organization_we_vote_id}
                        hide_stop_following_button={this.props.hide_stop_following_button}/>
          { this.props.hide_ignore_button ?
            null :
            <button className="btn btn-default btn-sm"
                    onClick={this.handleIgnore.bind(this, organization.organization_we_vote_id)}>
              Ignore
            </button> }
        </VoterGuideDisplayForList>;
      }
    });
    // console.log("GuideList organization_list: ", organization_list);

    return <div className="guidelist card-child__list-group">
        <ReactCSSTransitionGroup transitionName="org-ignore" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
          { organization_list.length ?
            organization_list :
            <div className="u-flex u-flex-column u-items-center">
              <div className="u-margin-top--sm u-stack--sm u-no-break">
                No results found.
              </div>
              <OpenExternalWebSite url="https://api.wevoteusa.org/vg/create/"
                                   className="opinions-followed__missing-org-link"
                                   target="_blank"
                                   title="Organization Missing?"
                                   body={<Button className="u-stack--xs" bsStyle="primary">Organization Missing?</Button>}
              />
              <div className="opinions-followed__missing-org-text u-stack--sm u-no-break">
                Don’t see an organization you want to Listen to?
              </div>
            </div>
          }
        </ReactCSSTransitionGroup>
      </div>;
  }

}
