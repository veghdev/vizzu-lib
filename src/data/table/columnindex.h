#ifndef COLUMNINDEX_H
#define COLUMNINDEX_H

#include <cstddef>
#include <cstdint>

#include "base/type/uniquetype.h"

namespace Vizzu
{
namespace Data
{

struct ColumnIndexTypeId
{};
typedef Type::UniqueType<uint64_t, ColumnIndexTypeId> ColumnIndex;

}
}

#endif
