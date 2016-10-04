import SinonAsPromised from "sinon-as-promised";
import Bluebird from "bluebird";


before(() => {
    // Automatically include Sinon-as-promised test suite wide.
    SinonAsPromised(Bluebird);
});