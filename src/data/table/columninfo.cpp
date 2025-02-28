#include "columninfo.h"

#include <algorithm>

#include "base/conv/tostring.h"
#include "base/math/floating.h"
#include "base/text/naturalcmp.h"
#include "base/text/smartstring.h"

using namespace Vizzu;
using namespace Data;

ColumnInfo::ColumnInfo()
{
	count = 0;
	name = "undefined";
	type = Type::measure;
	contiType = ContiType::Unknown;
}

ColumnInfo::ColumnInfo(const std::string &name, TextType textType)
{
	count = 0;
	contiType = ContiType::Unknown;
	this->name = name;

	auto open = name.find("[");
	auto close = name.find("]");
	auto beg = open + 1;
	auto end = close - 1;
	if (open != std::string::npos && close != std::string::npos
	    && end >= beg) {
		unit = name.substr(beg, end - beg + 1);
	};

	switch (textType) {
	case TextType::Number:
		type = Type::measure;
		contiType = ContiType::Integer;
		break;

	default: type = Type::dimension; break;
	}
}

std::string ColumnInfo::toJSon() const
{
	std::string res;
	res = "{";
	res += "\"name\":\"" + name + "\"";
	res += ",\"type\":\"" + Conv::toString(type) + "\"";
	res += ",\"unit\":\"" + unit + "\"";
	res += ",\"length\":\"" + Conv::toString(count) + "\"";
	if (type == Type::measure) {
		res += ",\"range\":{";
		res += "\"min\":\"" + Conv::toString(range.getMin()) + "\"";
		res += ",\"max\":\"" + Conv::toString(range.getMax()) + "\"";
		res += "}";
	}
	else {
		res += ",\"categories\":[";
		for (auto it = values.begin(); it != values.end(); ++it) {
			res += "\"" + *it + "\"";
			if (it != values.end() - 1) res += ",";
		}
		res += "]";
	}
	res += "}";
	return res;
}

void ColumnInfo::sort()
{
	std::sort(values.begin(), values.end(), Text::NaturalCmp());
	valueIndexes.clear();
	for (auto i = 0u; i < values.size(); i++)
		valueIndexes.insert({values[i], i});
}

void ColumnInfo::reset()
{
	count = 0;
	if (type == ColumnInfo::Type::measure)
		contiType = ContiType::Integer;
	range = Math::Range<double>();
}

ColumnInfo::Type ColumnInfo::getType() const { return type; }

ColumnInfo::ContiType ColumnInfo::getContiType() const
{
	return contiType;
}

const ColumnInfo::ValueIndexes &
ColumnInfo::dimensionValueIndexes() const
{
	return valueIndexes;
}

const ColumnInfo::Values &ColumnInfo::categories() const
{
	return values;
}

size_t ColumnInfo::dimensionValueCnt() const { return values.size(); }

std::string ColumnInfo::getName() const { return name; }

std::string ColumnInfo::getUnit() const { return unit; }

Math::Range<double> ColumnInfo::getRange() const { return range; }

double ColumnInfo::registerValue(double value)
{
	count++;

	switch (type) {
	case Type::measure: {
		range.include(value);
		if (!Math::Floating(value).isInteger())
			contiType = ContiType::Float;
		return value;
	} break;

	case Type::dimension:
		throw std::logic_error(
		    "internal error, double as isDimension value");

	default: throw std::logic_error("internal error, no series type");
	}
}

double ColumnInfo::registerValue(const std::string &value)
{
	count++;

	switch (type) {
	case Type::measure: {
		if (value.empty()) {
			double val = 0.0;
			range.include(val);
			return val;
		}

		const char* strVal = value.c_str();
		char* eof;
		double val = std::strtod(strVal, &eof);
		if (eof == strVal)
			throw std::logic_error(
				"internal error, cell should be numeric: " + value);

		range.include(val);
		if (!Math::Floating(val).isInteger())
			contiType = ContiType::Float;

		return val;
	} break;

	case Type::dimension: {
		auto it = valueIndexes.find(value);
		if (it != valueIndexes.end()) { return static_cast<double>(it->second); }
		else {
			auto index = values.size();
			values.push_back(value);
			valueIndexes.insert({value, index});
			return static_cast<double>(index);
		}
	} break;

	default:;
	}
	throw std::logic_error("internal error, no series type");
}

std::string ColumnInfo::toString(double value) const
{
	if (type == Type::measure) return std::to_string(value);
	if (type == Type::dimension) return values.at(value);
	return "N.A.";
}

const char *ColumnInfo::toDimensionString(double value) const
{
	if (type == Type::dimension) return values.at(value).c_str();
	return nullptr;
}

std::string ColumnInfo::toString() const
{
	auto res = name;
	if (type == Type::measure)
		; // res += " (" + std::to_string(count) + ")";
	else
		res += " [" + std::to_string(values.size()) + "]";
	return res;
}

size_t ColumnInfo::minByteWidth() const
{
	if (type == Type::dimension) {
		if (values.size() <= 0x7F) return 1;
		if (values.size() <= 0x7FFF) return 2;
		if (values.size() <= 0x7FFFFFFF) return 4;
		return 8;
	}
	if (type == Type::measure) {
		if (contiType == ContiType::Float) return 8;
		if (contiType == ContiType::Integer) {
			if (range.getMin() >= -1 * 0x7Fll
			    && range.getMax() <= 0x7Fll)
				return 1;
			if (range.getMin() >= -1 * 0x7FFFll
			    && range.getMax() <= 0x7FFFll)
				return 2;
			if (range.getMin() >= -1 * 0x7FFFFFFFll
			    && range.getMax() <= 0x7FFFFFFFll)
				return 4;
			return 8;
		}
	}
	return 8;
}
