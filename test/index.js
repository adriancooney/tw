import util from "util";
import sinon from "sinon";
import SinonAsPromised from "sinon-as-promised";
import Bluebird from "bluebird";


before(() => {
    // Automatically include Sinon-as-promised test suite wide.
    SinonAsPromised(Bluebird);

    // Print the damn args passed sinon, jez
    sinon.format = util.inspect;
});