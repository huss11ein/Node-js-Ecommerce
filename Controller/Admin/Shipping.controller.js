const shippingFees = require("../../Models/shippingFees.Models");
const { Country, State, City } = require("country-state-city");
const { none } = require("../../middleware/uploadImage");

class shipping {
  static GetAllCities = async (req, res) => {
    try {
      let country = await shippingFees.findOne({ Country: req.params.name });

      res.status(201).send(country.cities);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static GetCountries = async (req, res) => {
    try {
      let countriesInfo = await shippingFees.find();
      let countries = [];
      countriesInfo.forEach((element) => {
        countries.push({ country: element.Country, id: element._id });
      });

      res.status(201).send(countries);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static updateFess = async (req, res) => {
    try {
      let country = await shippingFees.findOne({
        Country: req.body.CountryName,
      });
      for (let element in country.cities) {
        if (country.cities[element].Name == req.body.cityName) {
          country.cities[element].fees = req.body.fees;
        }
      }
      await country.save();
      res.status(201).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static AddCountryWithAllCites = async (req, res) => {
    try {
      let CountryReq = Country.getAllCountries().filter(
        (e) => e.name == req.body.CountryName
      );

      let country = await shippingFees({ Country: CountryReq[0].name }).save();

      let states = State.getStatesOfCountry(CountryReq[0].isoCode);

      states.forEach((state) => {
        country.cities.push({
          Name: state.name.replace(" Governorate", ""),
        });
      });
      await country.save();

      res.status(201).send();
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static GetAllCitesWeShipTO = async (req, res) => {
    try {
      let allData = await shippingFees.findOne({ Country: req.params.name });
      let cities = [];

      allData.cities.forEach((element) => {
        if (element.fees) {
          cities.push(element);
        }
      });

      res.status(201).send(cities);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };

  static getCitesWithoutfees = async (req, res) => {
    try {
      let allData = await shippingFees.findOne({ Country: req.params.name });
      let cities = [];

      allData.cities.forEach((element) => {
        if (!element.fees) {
          cities.push(element);
        }
      });

      res.status(201).send(cities);
    } catch (e) {
      res.status(400).send(e.message);
    }
  };
  static getAllCountrisInWorld = async (req, res) => {
    try {
      let country = Country.getAllCountries();
      let countries = [];
      country.forEach((element) => {
        countries.push(element.name);
      });
      res.send(countries);
    } catch (error) {
      res.status(400).send(e.message);
    }
  };
  static getcitiesOfCountry = async (req, res) => {
    try {
      let allData = await shippingFees.findById(req.params.id);
      let cities = [];

      allData.cities.forEach((e) => {
        cities.push({ City: e });
      });

      res.send(cities);
    } catch (error) {
      res.status(400).send(e.message);
    }
  };
  static getcitiesOfCountryweship = async (req, res) => {
    try {
      let allData = await shippingFees.findById(req.params.id);
      let cities = [];

      allData.cities.forEach((e) => {
        if (e.fees) {
          cities.push({ City: e });
        }
      });

      res.send(cities);
    } catch (error) {
      res.status(400).send(e.message);
    }
  };
}
module.exports = shipping;
