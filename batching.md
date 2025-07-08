# 🧠 Eco-Route Batching Logic

This document explains how we group delivery orders into optimized route batches per Walmart store and delivery time slot.

---

## 🚚 Problem Statement

Walmart receives multiple delivery orders across different regions and times. To deliver efficiently, we aim to:

* Batch nearby delivery addresses together
* Optimize routes from each Walmart store
* Consider carbon footprint, AQI, and sensitive zones
* Respect delivery **time slots** customers selected

---

## 🧩 Batching Strategy Overview

### Step-by-Step:

1. **Fetch all unbatched delivery orders from the database** (no store assigned yet)
2. **Iterate over upcoming time slots**:

   * For each time slot:

     * Cluster orders in that slot geographically using DBSCAN
     * For each cluster:

       * **Find the nearest Walmart store** to the cluster center
       * Assign that store to all orders in the cluster
       * **Use the `eco_route()` function** to compute an optimized delivery route
       * **Store the result** with a unique `batch_id`

---

## 🧾 Sample Pseudo Code

for slot in upcoming_time_slots:
    pending_orders = get_unbatched_orders(slot) //db call
    clusters = cluster_orders(pending_orders)  //backend call

    for cluster in clusters:
        nearest_store = find_nearest_store(cluster, all_stores)  //backend call

        result = eco_route({
            "source": {
                "lat": nearest_store["lat"],
                "lng": nearest_store["lng"]
            },
            "destinations": cluster
        })  //backend call

        assign_orders_to_store(cluster, nearest_store["id"])
        save_route(batch_id=generate_batch_id(), route=result, time_slot=slot)

---

## 🛠 Notes

* `cluster_orders()` uses DBSCAN to group geographically close orders
* `eco_route()` calculates optimal routes using:

  * AQI sampling
  * Overpass sensitive zone count
  * Emissions + traffic-based time/distance
  * TSP solver
* `find_nearest_store()` uses Haversine or matrix API to get the closest Walmart store
* `assign_orders_to_store()` records the selected store ID and slot for each clustered order
* `save_route()` persists the batch route with metadata (store ID, slot, batch ID)

---

## ✅ Benefits of This System

* Lower total emissions
* Shorter delivery routes
* Efficient batching per region and time window
* Scalable across Walmart stores and customer delivery slots
