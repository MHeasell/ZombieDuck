
function GameCtrl ($scope) {
	$scope.history = [
		{type: "command", text: "foo"},
		{type: "response", text: "You foo the thing. It is verily foo'd."}
	];

	$scope.enterCmd = function () {
		$scope.history.push({type: "command", text: $scope.cmdText});
		$scope.history.push({type: "response", text: "Sorry... I can't do that!"});
	};
}
