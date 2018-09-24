import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import { Link } from "react-router";
import { renderLog } from "../../utils/logging";
import OrganizationStore from "../../stores/OrganizationStore";
import OrganizationActions from "../../actions/OrganizationActions";
import OpenExternalWebSite from "../../utils/OpenExternalWebSite";
import OpinionsFollowedListCompressed from "../Organization/OpinionsFollowedListCompressed";

export default class NetworkOpinionsFollowed extends Component {
  static propTypes = {
    children: PropTypes.object,
    history: PropTypes.object
  };

  constructor (props) {
    super(props);
    this.state = {
      organizations_followed_list: [],
      editMode: false
    };
  }

  componentDidMount () {
    this.organizationStoreListener = OrganizationStore.addListener(this._onOrganizationStoreChange.bind(this));
    this._onOrganizationStoreChange();
    OrganizationActions.organizationsFollowedRetrieve();
  }

  componentWillUnmount (){
    this.organizationStoreListener.remove();
  }

  _onOrganizationStoreChange (){
    let organizations_followed_list = OrganizationStore.getOrganizationsVoterIsFollowing();
    if (organizations_followed_list && organizations_followed_list.length) {
      const OPINIONS_TO_SHOW = 3;
      let organizations_followed_list_limited = organizations_followed_list.slice(0, OPINIONS_TO_SHOW);
      this.setState({
        organizations_followed_list: organizations_followed_list_limited
      });
    }
  }

  getCurrentRoute (){
    var current_route = "/opinions_followed";
    return current_route;
  }

  toggleEditMode (){
    this.setState({editMode: !this.state.editMode});
  }

  onKeyDownEditMode (event) {
    let enterAndSpaceKeyCodes = [13, 32];
    let scope = this;
    if (enterAndSpaceKeyCodes.includes(event.keyCode)) {
      scope.setState({editMode: !this.state.editMode});
    }
  }

  getFollowingType (){
    switch (this.getCurrentRoute()) {
      case "/opinions":
        return "WHO_YOU_CAN_FOLLOW";
      case "/opinions_followed":
      default :
        return "WHO_YOU_FOLLOW";
    }
  }

  render () {
    renderLog(__filename);
    // console.log("NetworkOpinionsFollowed, this.state.organizations_followed_list: ", this.state.organizations_followed_list);
    return <div className="opinions-followed__container">
      <section className="card">
        <div className="card-main">
          <h1 className="h4">Who You Are Listening To</h1>
          <div className="voter-guide-list card">
            <div className="card-child__list-group">
              {
                this.state.organizations_followed_list && this.state.organizations_followed_list.length ?
                  <span>
                    <OpinionsFollowedListCompressed organizationsFollowed={this.state.organizations_followed_list}
                                                    editMode={this.state.editMode}
                                                    instantRefreshOn />
                    <Link to="/opinions_followed">See All</Link>
                  </span> :
                  <span>You are not listening to any organizations yet.</span>
              }
            </div>
          </div>
          <OpenExternalWebSite url="https://api.wevoteusa.org/vg/create/"
                               className="opinions-followed__missing-org-link"
                               target="_blank"
                               title="Suggest Organization"
                               body={<Button className="u-stack--xs" bsStyle="primary">Suggest Organization</Button>}
          />
          <div className="opinions-followed__missing-org-text u-no-break">
            Don’t see your favorite organization?
          </div>
          <br />
        </div>
      </section>
    </div>;
  }
}
